# 基于主题的消息传递

NATS 是一种在名为 `Subjects`（主题）的通信通道上发布和监听消息的系统。从根本上讲，NATS 是一种 `interest-based`（基于兴趣）的消息传递系统，其中监听者必须 `subscribe`（订阅）一组特定的 `Subjects`。

在其他中间件系统中，主题可能被称为 `topics`、`channels` 或 `streams`（请注意，在NATS中，“stream”一词用于指代 [JetStream](jetstream/README.md) 消息存储）。

**什么是主题？**
最简单地说，主题只是一个字符串，发布者和订阅者可以使用它来相互识别。更常见的是使用[主题层次结构](#subject-hierarchies)将消息划分为语义命名空间。

{% hint style="info" %}
请查看此处有关主题命名的[约束和约定](#characters-allowed-and-recommended-for-subject-names)。
{% endhint %}

**位置透明性**
通过基于主题的寻址，NATS 在一个（大型）路由 NATS 服务器云中提供了位置透明性。

* 主题订阅会自动在服务器云中传播。
* 消息会自动路由到所有感兴趣的订阅者，而无需考虑其位置。
* 如果没有订阅者订阅某个主题的消息，则该消息会被自动丢弃（请参阅 [JetStream](jetstream/README.md) 功能以了解消息持久化）。

![](../.gitbook/assets/subjects1.svg)

## 通配符

NATS 提供了两个 _通配符_，可用于替代点分隔主题中的一个或多个元素。发布者始终会发送消息到完全指定的主题，而不使用通配符。而订阅者可以使用这些通配符通过单个订阅来监听多个主题。

## 主题层次结构

`.` 字符用于创建主题层次结构。例如，一个世界时钟应用程序可能会定义以下内容，以逻辑方式对相关主题进行分组：

```markup
time.us
time.us.east
time.us.east.atlanta
time.eu.east
time.eu.east.warsaw
```

## 主题使用的最佳实践

主题的大小没有硬性限制，但建议将主题中的标记（tokens）数量保持在一个合理的范围内。例如，最多 16 个标记，主题长度不超过 256 个字符。

### 主题数量

NATS 可以高效地管理数千万个主题，因此您可以为业务实体使用细粒度的地址。主题是临时资源，当不再有订阅时，它们将消失。

然而，服务器需要在内存中缓存主题订阅。如果您的订阅主题数量增加到超过一百万个，您将需要超过 1GB 的服务器内存，并且从那里开始会线性增长。

### 基于主题的过滤和安全性

可以通过多种方式和配置元素对消息主题进行过滤，例如：

* 安全性 - 按用户允许/拒绝
* 账户之间的导入/导出
* 自动转换
* 当插入消息到 JetStream 流时
* 当源或镜像 JetStream 流时
* 当连接叶节点（NATS 边缘服务器）时
* ...

设计良好的主题层次结构将使这些任务变得更加容易。

### 命名事物

{% hint style="info" %}
计算机科学中只有两个难题：缓存失效、命名，还有差一个（off-by-one）错误。-- 佚名
{% endhint %}

主题层次结构是一种强大的工具，用于定位您的应用程序资源。因此，大多数 NATS 用户会在主题名称中编码业务语义。您可以自由选择适合您目的的结构，但在项目开始时应避免过度复杂化主题设计。

**一些 guidelines:**

* 使用第一个或前几个标记（token）建立通用命名空间。

````shell
factory1.tools.group42.unit17
````

* 使用最后一个或最后几个标记作为标识符。

````shell
service.deploy.server-acme.app123
````

* 一个主题 _应该_ 用于多个消息。
* 订阅 _应该_ 稳定（存在以接收多个消息）。
* 尽可能使用通配符订阅，而不是单独订阅每个主题。
* 命名业务或物理实体。避免在主题中编码过多数据。
* 将（业务）意图编码到主题中，而不是技术细节。

✅ 实用的：

````shell
orders.online.store123.order171711
````

❌ 也许没那么有用：

````shell
orders.online.us.server42.ccpayment.premium.store123.electronics.deliver-dhl.order171711.create
````

* NATS 消息支持 headers。这些可以用于附加元数据。有一些订阅模式仅提供 headers，从而可以在消息流中高效扫描元数据。

### 匹配单个标记

第一个通配符是 `*`，它可以匹配单个标记。例如，如果一个应用程序想要监听东部时区，它可以订阅 `time.*.east`，这将匹配 `time.us.east` 和 `time.eu.east`。注意，`*` 不能匹配标记内的子字符串 `time.New*.east`。

![](../.gitbook/assets/subjects2.svg)

### 匹配多个标记

第二个通配符是 `>`，它可以匹配一个或多个标记，并且只能出现在主题的末尾。例如，`time.us.>` 将匹配 `time.us.east` 和 `time.us.east.atlanta`，而 `time.us.*` 只会匹配 `time.us.east`，因为它无法匹配多个标记。

![](../.gitbook/assets/subjects3.svg)

### 监控和监听

根据您的安全配置，通配符可用于监控，创建所谓的“监听器”。在最简单的情况下，您可以创建一个订阅者 `>`。这个应用程序将收到您的 NATS 集群上发送的所有消息——同样受到安全设置限制。

### 混合使用通配符

通配符 `*` 允许在同一个主题中多次出现。两种类型也可以同时使用。例如，`*.*.east.>` 可以接收 `time.us.east.atlanta`。

## 允许及推荐用于主题名称的字符

为了跨客户端的兼容性和便于维护配置文件，我们建议使用字母数字字符、`-`（连字符）和 `_`（下划线）ASCII 字符作为主题和其他由用户创建的实体名称。

UTF-8（UTF8）字符在主题中得到支持。请自行承担使用多语言名称的风险。使用多语言名称作为技术实体名称可能会导致编辑、配置文件、显示和跨国合作方面的许多问题。

此处的规则和建议适用于所有系统名称、主题、流、持久化、桶、键（在键值存储中），因为 NATS 将创建包含这些名称的 API 主题。NATS 在大多数情况下会强制执行这些约束，但我们建议不要依赖于此。

*   **允许的字符**：任何 Unicode 字符，除了 `null`、空格、`.`、`*` 和 `>`。

*   **推荐的字符**：（`a` - `z`）、（`A` - `Z`）、（`0` - `9`）、`-` 和 `_`（名称区分大小写，且不能包含空格）。

*   **命名约定**：如果您想分隔单词，请使用大驼峰式命名法，如 `MyServiceOrderCreate`，或者使用 `-` 和 `_`，如 `my-service-order-create`。

*   **特殊字符**：句点 `.`（用于分隔主题中的令牌）以及 `*` 和 `>`（`*` 和 `>` 用作通配符）是保留字符，不能使用。

*   **保留名称**：按照约定，以 `$` 开头的主题名称保留给系统使用（例如，以 `$SYS`、`$JS` 或 `$KV` 等开头的主题名称）。许多系统主题也使用 `_`（下划线）（例如 `_INBOX`、`KV_ABC`、`OBJ_XYZ` 等）。

✅ 良好的名称示例：

```markup
time.us
time.us2.east1
time.new-york
time.SanFrancisco
```

已经弃用的主题名称示例：

```markup
location.Malmö
$location.Stockholm
_Subjects_.mysubject
```

不允许的**流**名称示例：

```markup
all*data
<my_stream>
service.stream.1
```

### 严格模式 (Pedantic mode)

出于性能考虑，默认在消息发布期间不验证主题名称。特别地，当以编程方式生成主题时，可能会导致产生无法被订阅的非法主题。例如，包含通配符的主题可能会被忽略。

要启用主题名称验证，请在客户端连接选项中激活 `pedantic` 模式。

```markup
//Java
Options options = Options.builder()
    .server("nats://127.0.0.1:4222")
    .pedantic()
    .build();
Connection nc = Nats.connect(options)
```
