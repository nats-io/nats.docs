# 主题映射与转换

主题映射与转换是 NATS 服务器的一项强大功能。转换（我们将会互换使用“映射”和“转换”这两个术语）适用于消息生成和摄取的多种情况，起到翻译的作用，在某些场景下也充当过滤器。

{% hint style="warning" %}
映射与转换是一个高级主题。在继续之前，请确保你已理解 NATS 的基本概念，如集群、账户和流。
{% endhint %}

**转换可以在以下位置定义（详见下文）：**

  * 在配置文件的根级别（应用于默认的 `$G` 账户）。这会应用于所有通过客户端或叶子节点连接进入此账户的匹配消息。不匹配的主题将保持不变。
  * 在单个账户级别，遵循与上述相同的规则。
  * 在导入到账户中的主题上。
  * 在 [JetStream](#subject-mapping-and-transforms-in-streams) 上下文中：
      * 对由流导入的消息进行转换
      * 对由 JetStream 重新发布的消息进行转换
      * 对通过 source 或 mirror 复制到流中的消息进行转换。在这种情况下，转换充当过滤器。

**转换可用于：**

  * 在命名空间之间进行转换。例如，在账户之间映射时，以及当集群和叶子节点对同一主题实现不同语义时。
  * 抑制主题。例如，为了测试而临时禁用。
  * 在更改主题命名层级后实现向后兼容。
  * 将多个主题合并在一起。
  * 通过在不同集群和叶子节点中使用不同的转换，在[超级集群或叶子节点上消除歧义和进行隔离](#cluster-scoped-mappings)。
  * 测试。例如，临时将一个测试主题合并到一个生产主题中，或将一个生产主题从生产消费者那里重定向开。
  * [对主题进行分区](#deterministic-subject-token-partitioning)和对 JetStream 流进行分区。
  * [过滤](#subject-mapping-and-transforms-in-streams)被复制（通过 source/mirror）到 JetStream 流中的消息。
  * [混沌测试和采样。映射可以是加权的](#weighted-mappings)。允许一定百分比的消息被重新路由，以模拟丢失、故障等情况。
  * ...

**优先级和操作顺序**

  * 转换在消息一进入定义了转换的作用域（集群、账户、叶子节点、流）时就会立即应用，无论消息是如何到达的（客户端发布、通过网关、流导入、流 source/mirror）。这发生在应用任何路由或订阅兴趣之前。在任何情况下，消息都将看起来像是从转换后的主题发布的。

  * 转换在同一作用域内**不会递归应用**。这是为了防止简单的循环。在下面的示例中，只有第一个匹配的规则会被应用。


```shell
mappings: {
  transform.order target.order
  target.order transform.order
}
```

  * 当消息穿过不同作用域时，转换会**按顺序应用**。例如：
    1.  一个主题在发布时被转换。
    2.  路由到一个叶子节点，并在叶子节点上接收时再次被转换。
    3.  导入到一个流中，并以一个转换后的名称存储。
    4.  从流中以最终的目标主题重新发布到 Core NATS。

在一个中心集群上：

```
server_name: "hub"
cluster: { name: "hub" }
mappings: {
  orders.* orders.central.{{wildcard(1)}}
}
```

或者

```
server_name: "hub"
cluster: { name: "hub" }
mappings: {
  orders.> orders.central.>}
}
```

在一个叶子集群上：

```
server_name: "store1"
cluster: { name: "store1" }
mappings: {
  orders.central.* orders.local.{{wildcard(1)}}
}
```

在叶子集群上的一个流配置：

```
{
  "name": "orders",
  "subjects": [ "orders.local.*"],
  "subject_transform":{"src":"orders.local.*","dest":"orders.{{wildcard(1)}}"},
  "retention": "limits",
  ...
  "republish": [
    {
      "src": "orders.*",
      "dest": "orders.trace.{{wildcard(1)}}""
    }
  ],
```

**安全**

当使用**基于配置文件的账户管理**（不使用 JWT 安全机制）时，你可以在服务器配置文件中定义 Core NATS 账户级别的主题转换。当你更改转换时，只需重新加载配置即可使其生效。

当使用 **operator JWT 安全机制**（分布式安全）和内置解析器时，你在账户 JWT 中定义转换和导入/导出。因此，在修改它们之后，只要你将更新后的账户 JWT 推送到服务器，它们就会立即生效。

**测试与调试**

{% hint style="info" %}
你可以使用 [`nats`](https://www.google.com/search?q=../using-nats/nats-tools/nats_cli/) CLI 工具的 `nats server mapping` 命令轻松测试单个主题转换规则。请参见下文示例。
{% endhint %}

{% hint style="info" %}
从 NATS 服务器 2.11（及之后发布的 NATS 版本）开始，可以使用 `nats trace` 来观察主题的处理过程，包括映射。

在下面的示例中，一条消息首先从 `orders.device1.order1` 被消除歧义，转换为 `orders.hub.device1.order1`。然后，它被导入到一个流中，并以其原始名称存储。

```shell
nats trace orders.device1.order1

Tracing message route to subject orders.device1.order1

Client "NATS CLI Version development" cid:16 cluster:"hub" server:"hub" version:"2.11.0-dev"
    Mapping subject:"orders.hub.device1.order1"
--J JetStream action:"stored" stream:"orders" subject:"orders.device1.order1"
--X No active interest

Legend: Client: --C Router: --> Gateway: ==> Leafnode: ~~> JetStream: --J Error: --X

Egress Count:

  JetStream: 1
```

{% endhint %}

## 简单映射

`foo:bar` 的例子很简单。服务器在主题 `foo` 上收到的所有消息都会被重新映射，订阅了 `bar` 的客户端可以接收到这些消息。

```
nats server mapping foo bar foo
> bar
```

当没有提供主题时，该命令将以交互模式运行：

```
nats server mapping foo bar
> Enter subjects to test, empty subject terminates.
>
> ? Subject foo
> bar

> ? Subject test
> Error: no matching transforms available
```

服务器配置示例。请注意，下面的映射仅适用于默认的 `$G` 账户。

```
server_name: "hub"
cluster: { name: "hub" }
mappings: {
    orders.flush  orders.central.flush 
	orders.* orders.central.{{wildcard(1)}}
}
```

映射一个完整通配符：

```
server_name: "hub"
cluster: { name: "hub" }
mappings: {
    orders.>  orders.central.> 
}
```

带账户的配置。此映射适用于特定账户。

```
server_name: "hub"
cluster: { name: "hub" }

accounts {
    accountA: {
        mappings: {
            orders.flush  orders.central.flush 
        	orders.* orders.central.{{wildcard(1)}}
        }
    }
}
```

## 映射完整通配符 '>'

完整通配符标记在源表达式中只能使用一次，并且也必须在目标表达式中出现一次。

示例：为主题添加前缀：

```
nats server mapping ">"  "baz.>" bar.a.b
> baz.bar.a.b
```

## 主题标记重排序

在目标映射中，可以使用位置编号来引用通配符标记（仅适用于 `nats-server` 2.8.0 及以上版本）。语法为：`{{wildcard(position)}}`。例如，`{{wildcard(1)}}` 引用第一个通配符标记，`{{wildcard(2)}}` 引用第二个通配符标记，以此类推。

示例：使用此转换 `"bar.*.*" : "baz.{{wildcard(2)}}.{{wildcard(1)}}"`，最初发布到 `bar.a.b` 的消息在服务器中被重新映射为 `baz.b.a`。到达服务器的 `bar.one.two` 消息将被映射为 `baz.two.one`，以此类推。你可以自己使用 `nats server mapping` 来尝试。

```
nats server mapping "bar.*.*"  "baz.{{wildcard(2)}}.{{wildcard(1)}}" bar.a.b
> baz.b.a
```

{% hint style="info" %}
你可能会在其他示例中看到一种较旧的、已弃用的映射语法，它使用 `$1`.`$2` 来代替 `{{wildcard(1)}}.{{wildcard(2)}}`。
{% endhint %}

## 丢弃主题标记

你可以通过不在目标转换中使用所有通配符标记来从主题中丢弃标记，但有一个例外：作为账户间导入/导出的一部分定义的映射，在这种情况下，**所有**通配符标记都必须在转换目标中使用。

```
nats server mapping "orders.*.*" "foo.{{wildcard(2)}}" orders.local.order1
> orders.order1
```

{% hint style="info" %}
导入/导出映射必须是双向无歧义的。
{% endhint %}

## 拆分标记

有两种方法可以拆分标记：

### 按分隔符拆分

你可以使用 `split(separator)` 转换函数，在每次出现分隔符字符串时拆分一个标记。

示例：

  * 按 '-' 拆分：`nats server mapping "*" "{{split(1,-)}}" foo-bar` 返回 `foo.bar`。
  * 按 '--' 拆分：`nats server mapping "*" "{{split(1,--)}}" foo--bar` 返回 `foo.bar`。

### 按偏移量拆分

你可以使用 `SplitFromLeft(wildcard index, offset)` 和 `SplitFromRight(wildcard index, offset)` 转换函数，在标记的开头或结尾的特定位置将其一分为二（请注意，所有主题转换函数名的大驼峰命名法是可选的，你也可以使用全小写的函数名）。

示例：

  * 从左侧第 4 个位置拆分标记：`nats server mapping "*" "{{splitfromleft(1,4)}}" 1234567` 返回 `1234.567`。
  * 从右侧第 4 个位置拆分标记：`nats server mapping "*" "{{splitfromright(1,4)}}" 1234567` 返回 `123.4567`。

## 切片标记

你可以使用 `SliceFromLeft(wildcard index, number of characters)` 和 `SliceFromRight(wildcard index, number of characters)` 映射函数，从标记的开头或结尾按特定间隔将标记切成多个部分。

示例：

  * 从左侧每 2 个字符切分：`nats server mapping "*" "{{slicefromleft(1,2)}}" 1234567` 返回 `12.34.56.7`。
  * 从右侧每 2 个字符切分：`nats server mapping "*" "{{slicefromright(1,2)}}" 1234567` 返回 `1.23.45.67`。

## 确定性主题标记分区

确定性标记分区允许你使用基于主题的寻址，来确定性地划分（分区）一个消息流，其中一个或多个主题标记被映射到一个分区键。确定性意味着，相同的标记总是被映射到相同的键。对于少量主题，这种映射看起来是随机的，并且可能不是`公平`的。

例如：新客户订单发布在 `neworders.<customer id>` 上，你可以使用 `partition(number of partitions, wildcard token positions...)` 函数将这些消息划分到 3 个分区号（桶）中，该函数通过以下映射返回一个分区号（介于 0 和分区数-1 之间）：`"neworders.*" : "neworders.{{wildcard(1)}}.{{partition(3,1)}}"`。

```
nats server mapping "neworders.*" "neworders.{{wildcard(1)}}.{{partition(3,1)}}" neworders.customerid1
> neworders.customerid1.0
```

{% hint style="info" %}
请注意，可以指定多个标记位置来形成一种\_复合分区键\_。例如，一个形式为 `foo.*.*` 的主题可以有一个分区转换为 `foo.{{wildcard(1)}}.{{wildcard(2)}}.{{partition(5,1,2)}}`，这将产生五个形式为 `foo.*.*.<n>` 的分区，但在计算分区号时会使用两个通配符标记的哈希值。

```
nats server mapping "foo.*.*" "foo.{{wildcard(1)}}.{{wildcard(2)}}.{{partition(5,1,2)}}" foo.us.customerid
> foo.us.customerid.0
```

{% endhint %}

这个特定的转换意味着任何发布在 `neworders.<customer id>` 上的消息都将被映射到 `neworders.<customer id>.<分区号 0、1 或 2>`。即：

| 发布主题            | 映射到                 |
| ------------------- | ---------------------- |
| neworders.customerid1 | neworders.customerid1.0 |
| neworders.customerid2 | neworders.customerid2.2 |
| neworders.customerid3 | neworders.customerid3.1 |
| neworders.customerid4 | neworders.customerid4.2 |
| neworders.customerid5 | neworders.customerid5.1 |
| neworders.customerid6 | neworders.customerid6.0 |

该转换是确定性的，因为（只要分区数为 3）'customerid1' 将始终映射到相同的分区号。该映射是基于哈希的，其分布是随机的，但趋向于“完美平衡”的分布（即，你映射的键越多，每个分区的键数量就越趋向于收敛到相同的数字）。

你可以同时对多个主题通配符标记进行分区，例如：`{{partition(10,1,2)}}` 将标记通配符 1 和 2 的联合分布在 10 个分区上。

| 发布主题 | 映射到     |
| -------- | ---------- |
| foo.1.a  | foo.1.a.1  |
| foo.1.b  | foo.1.b.0  |
| foo.2.b  | foo.2.b.9  |
| foo.2.a  | foo.2.a.2  |

这种确定性分区转换使得使用单个订阅者（订阅 `neworders.*`）订阅的消息能够被分发到三个可以并行操作的独立订阅者（分别订阅 `neworders.*.0`、`neworders.*.1` 和 `neworders.*.2`）。

```
nats server mapping "foo.*.*" "foo.{{wildcard(1)}}.{{wildcard(2)}}.{{partition(3,1,2)}}"
```

### 确定性分区何时有用

Core NATS 的队列组和 JetStream 的持久消费者机制用于在多个订阅者之间分发消息，这些机制是无分区且非确定性的，这意味着不保证在同一主题上发布的两个连续消息会被分发到同一个订阅者。虽然在大多数用例中，完全动态、需求驱动的分发正是你所需要的，但它牺牲了顺序保证。因为如果两个后续消息可以被发送到两个不同的订阅者，它们可能会以不同的速度同时处理这些消息（或者消息需要重传，或者网络很慢等），这可能导致潜在的“消息乱序交付”。

这意味着，如果应用要求严格有序的消息处理，你需要将消息的分发限制为“一次一个”（每个消费者/队列组，即使用 'max acks pending' 设置），这反过来又会损害可伸缩性，因为这意味着无论你有多少个工作者订阅，一次只有一个在进行处理工作。

能够以确定性的方式均匀地拆分（即分区）主题（意味着特定主题上的所有消息总是映射到同一个分区），使你能够在分发和扩展主题流中消息处理的同时，仍然保持每个主题的严格顺序。例如，在流定义中将分区号作为标记插入到消息主题中，然后使用主题过滤器为每个分区（或一组分区）创建一个消费者。

确定性分区的另一个场景是，在极端消息发布速率下，你达到了使用通配符主题捕获消息的流的传入消息吞吐量极限。这个极限最终可能在非常高的消息速率下达到，因为单个 nats-server 进程作为任何给定流的 RAFT leader (协调者)，因此可能成为一个限制因素。在这种情况下，将该流分发（即分区）成多个较小的流（每个流都有自己的 RAFT leader，因此所有这些 RAFT leader 分布在集群中所有启用了 JetStream 的 nats-server 上，而不是单个服务器上），以便进行扩容。

确定性分区可以提供帮助的另一个用例是，如果你想利用订阅进程在处理消息时需要访问的本地数据缓存（例如上下文或可能很重的历史数据）。

## 加权映射

流量可以按百分比从一个主题转换拆分到多个主题转换。

### 用于 A/B 测试或金丝雀发布

这是一个金丝雀部署的例子，从你的服务版本 1 开始。

应用程序会向位于 `myservice.requests` 的服务发出请求。执行服务器工作的响应者会订阅 `myservice.requests.v1`。你的配置将如下所示：

```
  myservice.requests: [
    { destination: myservice.requests.v1, weight: 100% }
  ]
```

所有对 `myservice.requests` 的请求都将发送到你的服务版本 1。

当版本 2 出现时，你会想通过金丝雀部署来测试它。版本 2 会订阅 `myservice.requests.v2`。启动你的服务实例。

更新配置文件，将发送到 `myservice.requests` 的一部分请求重定向到你的服务版本 2。

例如，下面的配置意味着 98% 的请求将发送到版本 1，2% 将发送到版本 2。

```
    myservice.requests: [
        { destination: myservice.requests.v1, weight: 98% },
        { destination: myservice.requests.v2, weight: 2% }
    ]
```

一旦你确定版本 2 是稳定的，你就可以将 100% 的流量切换到它，然后你就可以关闭服务的版本 1 实例。

### 用于测试中的流量整形

流量整形在测试中也很有用。你可能有一个在 QA 环境中运行的服务，它模拟故障场景，可以接收 20% 的流量来测试服务请求者。

`myservice.requests.*: [{ destination: myservice.requests.{{wildcard(1)}}, weight: 80% }, { destination: myservice.requests.fail.{{wildcard(1)}}, weight: 20% }`

### 用于人为制造丢包

另外，通过将一部分流量映射到同一主题，可以为你的系统引入丢包以进行混沌测试。在这个极端的例子中，发布到 `foo.loss.a` 的 50% 的流量将被服务器人为丢弃。

`foo.loss.>: [ { destination: foo.loss.>, weight: 50% } ]`

你可以同时进行拆分和引入丢包进行测试。这里，90% 的请求会发送到你的服务，8% 会发送到一个模拟故障条件的服务，而未计算的 2% 将模拟消息丢失。

`myservice.requests: [{ destination: myservice.requests.v3, weight: 90% }, { destination: myservice.requests.v3.fail, weight: 8% }]` 剩余的 2% 被“丢失”了。

## 集群作用域映射

如果你正在运行一个超级集群，你可以定义仅适用于从特定集群发布的消息的转换。

例如，如果你有 3 个名为 `east`、`central` 和 `west` 的集群，并且你想将在 `east` 集群中发布在 `foo` 上的消息映射到 `foo.east`，在 `central` 集群中发布的消息映射到 `foo.central`，对于 `west` 也是如此，你可以通过在映射源和目标中使用 `cluster` 关键字来实现。

```
mappings = {
        "foo":[
               {destination:"foo.west", weight: 100%, cluster: "west"},
               {destination:"foo.central", weight: 100%, cluster: "central"},
               {destination:"foo.east", weight: 100%, cluster: "east"}
        ]
}
```

这意味着应用程序在部署方面是可移植的，不需要配置它所连接的集群名称来构成主题：它只需发布到 `foo`，服务器将根据其运行所在的集群将其映射到适当的主题。

## 流中的主题映射与转换

你可以将主题映射转换定义为流配置的一部分。

转换可以应用于流配置中的多个位置：

  * 你可以将主题映射转换作为流 mirror 的一部分应用。
  * 你可以将主题映射转换作为流 source 的一部分应用。
  * 你可以应用一个整体的流入口主题映射转换，该转换适用于所有匹配的消息，无论它们如何被摄取到流中。
  * 你还可以将主题映射转换作为消息重新发布的一部分应用。

请注意，当在 Mirror、Sources 或 Republish 中使用时，主题转换是带有可选转换功能的过滤器，而当在流配置中使用时，它只转换匹配消息的主题，不充当过滤器。

```
{
  "name": "orders",
  "subjects": [ "orders.local.*"],
  "subject_transform":{"src":"orders.local.*","dest":"orders.{{wildcard(1)}}"},
  "retention": "limits",
  ...
  "sources": [
    {
      "name": "other_orders",
      "subject_transforms": [
        {
          "src": "orders.online.*",
          "dest": "orders.{{wildcard(1)}}"
        }
      ]
    }
  ],
  "republish": [
    {
      "src": "orders.*",
      "dest": "orders.trace.{{wildcard(1)}}""
    }
  ]
    
}
```

{% hint style="info" %}
对于 `sources` 和 `republish` 转换，`src` 表达式将充当过滤器。不匹配的主题将被忽略。

对于流级别的 `subject_transform`，不匹配的主题将保持不变。
{% endhint %}
![](../assets/images/stream-transform.png)