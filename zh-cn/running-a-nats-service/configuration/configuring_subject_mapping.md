# 主题映射和流量整形

_自 NATS 服务器版本 2.2 起支持_

主题映射是 NATS 服务器的一个非常强大的功能，可用于金丝雀部署、A/B 测试、混沌测试以及迁移到新的主题命名空间。

## 配置主题映射

主题映射在账户级别定义和应用。如果你使用静态账户安全，则需要编辑服务器配置文件，但如果你使用 JWT 安全（运营商模式），则需要使用 nsc 或客户工具编辑并将更改推送到你的账户。

注意：_你也可以在定义账户之间的导入和导出时使用主题映射_

### 静态认证

在任何静态认证模式中，映射都在服务器配置文件中定义，对配置文件中映射的任何更改将在向服务器进程发送重新加载信号后立即生效（例如使用 `nats-server --signal reload`）。

`mappings` 节可以在顶层应用于全局账户，也可以在特定账户范围内。

```text
mappings = {

  # 简单的直接映射。发布到 foo 的消息被映射到 bar。
  foo: bar

  # 可以使用 $<N> 表示令牌位置来重新映射token。
  # 在此示例中，bar.a.b 将被映射到 baz.b.a。
  bar.*.*: baz.$2.$1

  # 你可以将映射限定到特定集群
  foo.cluster.scoped : [
    { destination: bar.cluster.scoped, weight:100%, cluster: us-west-1 }
  ]

  # 使用加权映射进行金丝雀测试或 A/B 测试。通过服务器重载随时动态更改。
  myservice.request: [
    { destination: myservice.request.v1, weight: 90% },
    { destination: myservice.request.v2, weight: 10% }
  ]

  # 通配符映射在两个主题之间平衡的测试示例。
  # 20% 的流量被映射到编码为失败的 QA 中的服务。
  myservice.test.*: [
    { destination: myservice.test.$1, weight: 80% },
    { destination: myservice.test.fail.$1, weight: 20% }
  ]

  # 一种混沌测试技巧，在发布到 foo.loss 的消息中引入 50% 的人工消息丢失
  foo.loss.>: [ { destination: foo.loss.>, weight: 50% } ]
}
```

### JWT 认证

使用 JWT 认证模式时，映射在账户的 JWT 中定义。账户 JWT 可以通过 [_JWT API_](https://github.com/nats-io/jwt) 或使用 `nsc` CLI 工具创建或修改。有关更详细的信息，请参阅 `nsc add mapping --help`、`nsc delete mapping --help`。主题映射更改在修改后的账户 JWT 被推送到 nats 服务器（即 `nsc push`）后立即生效。

使用 `nsc` 管理映射的示例：

* 添加新映射：`nsc add mapping --from "a" --to "b"`
* 修改条目，例如事后设置权重：`nsc add mapping --from "a" --to "b" --weight 50`
* 从一个主题添加两个条目，设置权重并多次执行：`nsc add mapping --from "a" --to "c" --weight 50`
* 删除映射：`nsc delete mapping --from "a"`

## 简单映射

`foo:bar` 的示例很简单。服务器在主题 `foo` 上接收到的所有消息都会被重新映射，并且可以被订阅 `bar` 的客户端接收。

## 主题令牌重排序

通配符令牌可以通过 `$<position>` 引用。例如，第一个通配符令牌是 $1，第二个是 $2，等等。引用这些令牌可以允许重新排序。

使用此映射：

```text
  bar.*.*: baz.$2.$1
```

最初发布到 `bar.a.b` 的消息在服务器中被重新映射到 `baz.b.a`。到达服务器 `bar.one.two` 的消息将被映射到 `baz.two.one`，依此类推。

## 用于 A/B 测试或金丝雀发布的加权映射

流量可以按百分比从一个主题拆分到多个主题。以下是一个用于金丝雀部署的示例，从你的服务版本 1 开始。

应用程序将在 `myservice.requests` 处向服务发出请求。执行服务器工作的响应者将订阅 `myservice.requests.v1`。你的配置将如下所示：

```text
  myservice.requests: [
    { destination: myservice.requests.v1, weight: 100% }
  ]
```

所有对 `myservice.requests` 的请求都将转到你的服务版本 1。

当版本 2 出现时，你将希望使用金丝雀部署来测试它。版本 2 将订阅 `myservice.requests.v2`。启动你的服务实例（不要忘记队列订阅者和负载平衡）。

更新配置文件以将发送到 `myservice.requests` 的部分请求重定向到你的服务版本 2。在这种情况下，我们将使用 2%。

```text
  myservice.requests: [
    { destination: myservice.requests.v1, weight: 98% },
    { destination: myservice.requests.v2, weight: 2% }
  ]
```

此时你可以[重新加载](../nats_admin/signals.md)服务器以零停机时间进行更改。重新加载后，2% 的请求将由新版本处理。

一旦你确定版本 2 稳定，将 100% 的流量切换过来，并使用新配置重新加载服务器。

```text
  myservice.requests: [
    { destination: myservice.requests.v2, weight: 100% }
  ]
```

现在即可关闭你第1版的服务实例。

## 把流量整形用作测试

流量整形在测试中很有用。你可能在 QA 中运行一个模拟故障场景的服务，该服务可以接收 20% 的流量来测试服务请求者。

```text
  myservice.requests.*: [
    { destination: myservice.requests.$1, weight: 80% },
    { destination: myservice.requests.fail.$1, weight: 20% }
  ]
```

## 人造丢包

或者，通过将一定百分比的流量映射到同一主题，在你的系统中引入丢失以进行混沌测试。在这个极端的示例中，发布到 `foo.loss.a` 的 50% 流量将被服务器人为丢弃。

```text
  foo.loss.>: [ { destination: foo.loss.>, weight: 50% } ]
```

你可以在测试中同时进行拆分和引入丢失。在这里，90% 的请求将转到你的服务，8% 将转到模拟故障条件的服务，未计入的 2% 将模拟消息丢失。

```text
  myservice.requests: [
    { destination: myservice.requests.v3, weight: 90% },
    { destination: myservice.requests.v3.fail, weight: 8% }
    # 剩余的 2% 被"丢失"
  ]
```

