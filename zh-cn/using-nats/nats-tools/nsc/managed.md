# 受管运营商

您可以使用 `nsc` 管理多个运营商（`Operators`）。运营商 可以被视为 nats-servers 的所有者，分为两类：本地和受管。关键区别在于，受管运营商是您没有其 nkey 的运营商。一个受管运营商的例子是 Synadia 的 [NGS](https://www.synadia.com/cloud?utm_source=nats_docs&utm_medium=nats)。

账户（`Accounts`）（由其 JWT 表示）由运营商签名。一些运营商可能会使用 JWT 的本地副本（即使用内存解析器），但大多数应使用内置在 'nats-server' 中的 NATS 账户解析器来管理其 JWT。Synadia 使用自制服务器软件来处理其 JWT，该服务器的工作方式与开源的账户服务器类似。

在处理基于服务器的运营商时，有一些特殊的命令：

* 可以使用 `nsc push` 将账户 JWT 推送到服务器
* 可以使用 `nsc pull` 从服务器拉取账户 JWT

对于受管运营商，这种推送/拉取行为已内置在 `nsc` 中。每次您编辑账户 JWT 时，`nsc` 都会将更改推送到受管运营商的服务器，并拉取签名后的响应。如果此操作失败，磁盘上的 JWT 可能与服务器上的值不匹配。您始终可以再次推送或拉取账户，而无需对其进行编辑。注意 - 推送仅在运营商 JWT 配置了账户服务器 URL 时才有效。

受管运营商不仅会使用其密钥对您的账户 JWT 进行签名，还可能编辑 JWT 以包含限制条件，从而约束您对其 NATS 服务器的访问权限。某些运营商还可能添加演示或标准导入。通常情况下，您可以移除这些内容，但运营商有权对所有账户编辑进行最终确认。与任何部署一样，受管运营商不会跟踪用户 JWT。

要开始使用受管运营商，您需要告知 `nsc` 有关该运营商的信息。有几种方法可以实现这一点。首先，您可以手动使用 `add operator` 命令告诉 `nsc` 下载运营商 JWT：

```bash
nsc add operator -i
```

运营商应向您提供其 JWT（或详细信息）。添加受管运营商的第二种方法是使用 `init` 命令：

```bash
nsc init -o synadia -n MyFirstAccount
```

您可以使用现有运营商的名称，或者一个众所周知的运营商（目前仅支持 "synadia"）。

一旦您添加了一个受管运营商，就可以正常地向其添加账户，需要注意的是，新账户如上所述会被推送和拉取。

## 定义“众所周知的运营商”

要定义一个众所周知的运营商，您需要通过简单的环境变量形式 `nsc_<operator name>_operator` 告诉 `nsc` 您希望环境中的人们通过名称使用某个运营商。该环境变量的值应为获取运营商 JWT 的 URL。例如：

```bash
export nsc_zoom_operator=https://account-server-host/jwt/v1/operator
```

这将告诉 `nsc` 存在一个名为 zoom 的众所周知的运营商，其 JWT 位于 `https://account-server-host/jwt/v1/operator`。通过此定义，您现在可以使用 `-u` 标志并指定名称 "zoom"，将该运营商添加到 `nsc` 存储目录中。

运营商 JWT 应设置其账户 JWT 服务器属性，以指向适当的 URL。对于我们的示例，这将是：

```bash
nsc edit operator -u https://account-server-host/jwt/v1
```

您还可以设置一个或多个服务 URL。这些 URL 允许 `nsc tool` 相关命令（例如 pub 和 sub）正常工作。例如：

```bash
nsc edit operator -n nats://localhost:4222
nsc tool pub hello world
```

