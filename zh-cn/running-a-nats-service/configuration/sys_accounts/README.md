# 系统事件

NATS 服务器利用[账户](../securing_nats/accounts.md)支持并生成事件，例如：

* 账户连接/断开连接
* 认证错误
* 服务器关闭
* 服务器统计摘要

此外，服务器支持有限数量的请求，可用于查询账户连接、服务器统计摘要和 ping 集群中的服务器。

这些事件通过配置 `system_account` 并使用 _系统账户_ 用户[订阅/请求](./#可用事件和服务)来启用。

使用[账户](../securing_nats/accounts.md)是为了让你的应用程序的订阅，比如 `>`，不会收到系统事件，反之亦然。使用账户需要以下之一：

* [本地配置认证](./#本地配置)并在 `system_account` 中列出一个账户
* 或者通过 [jwt](../securing_nats/jwt/) 使用去中心化认证和授权，如本[教程](sys_accounts.md)所示。在这种情况下，`system_account` 包含账户公钥。

注意：默认全局账户 `$G` 不发布通告。

## 可用事件和服务

### 系统账户

系统账户在已知主题模式下发布消息。

服务器发布的事件：

* `$SYS.ACCOUNT.<id>.CONNECT`（客户端连接）
* `$SYS.ACCOUNT.<id>.DISCONNECT`（客户端断开连接）
* `$SYS.ACCOUNT.<id>.SERVER.CONNS`（账户的连接更改）
* `$SYS.SERVER.<id>.CLIENT.AUTH.ERR`（认证错误）
* `$SYS.SERVER.<id>.STATSZ`（统计摘要）

此外，具有系统账户权限的其他工具可以发起请求（示例可以在[这里](sys_accounts.md#系统服务)找到）：

* `$SYS.REQ.SERVER.<id>.STATSZ`（请求服务器统计摘要）
* `$SYS.REQ.SERVER.PING`（发现服务器 - 将返回多条消息）

下表中列出的[监控端点](../monitoring.md)可作为系统服务使用以下主题模式访问：

* `$SYS.REQ.SERVER.<id>.<endpoint-name>`（请求与端点名称对应的服务器监控端点。）
* `$SYS.REQ.SERVER.PING.<endpoint-name>`（从所有服务器请求与端点名称对应的服务器监控端点 - 将返回多条消息）

| Endpoint                                                                  | Endpoint Name |
| ------------------------------------------------------------------------- | ------------- |
| [General Server Information](../monitoring.md#general-information)        | `VARZ`        |
| [Connections](../monitoring.md#connection-information)                    | `CONNZ`       |
| [Routing](../monitoring.md#route-information)                             | `ROUTEZ`      |
| [Gateways](../monitoring.md#gateway-information)                          | `GATEWAYZ`    |
| [Leaf Nodes](../monitoring.md#leaf-nodes-information)                     | `LEAFZ`       |
| [Subscription Routing](../monitoring.md#subscription-routing-information) | `SUBSZ`       |
| [JetStream](../monitoring.md#jetstream-information)                       | `JSZ`         |
| [Accounts](../monitoring.md#account-information)                          | `ACCOUNTZ`    |
| [Health](../../nats_admin/monitoring/#health)                            | `HEALTHZ`     |

* `"$SYS.REQ.ACCOUNT.<account-id>.<endpoint-name>`（从所有服务器请求与账户 ID 和端点名称对应的账户特定监控端点 - 将返回多条消息）

| Endpoint                                                                  | Endpoint Name |
| ------------------------------------------------------------------------- | ------------- |
| [Connections](../monitoring.md#connection-information)                    | `CONNZ`       |
| [Leaf Nodes](../monitoring.md#leaf-nodes-information)                     | `LEAFZ`       |
| [Subscription Routing](../monitoring.md#subscription-routing-information) | `SUBSZ`       |
| [JetStream](../monitoring.md#jetstream-information)                       | `JSZ`         |
| [Account](../monitoring.md#account-information)                           | `INFO`        |

像 `nats-account-server` 这样的服务器在声明更新时在系统账户下发布消息，nats-server 监听它们，并相应地更新其账户信息：

* `$SYS.ACCOUNT.<id>.CLAIMS.UPDATE`

通过少量的这些消息，你可以构建有用的监控工具：

* 服务器的健康/负载
* 客户端连接/断开连接
* 账户连接
* 认证错误

## 本地配置

要使用系统事件，使用系统账户即可，你的配置可以如下所示：

```
accounts: {
    USERS: {
        users: [
            {user: a, password: a}
        ]
    },
    SYS: { 
        users: [
            {user: admin, password: changeit}
           ]
    },
}
system_account: SYS
```

请注意，应用程序现在必须进行认证，以便连接可以与账户关联。在此示例中，选择用户名和密码是为了演示的简单性。像这样订阅所有系统事件 `nats sub -s nats://admin:changeit@localhost:4222 ">"` 并观察当你执行类似 `nats pub -s "nats://a:a@localhost:4222" foo bar` 的操作时会发生什么。关于如何使用系统服务的示例可以在[这里](sys_accounts.md#系统服务)找到。
