---
description: WebSocket 配置示例
---

# 配置

要在服务器中启用 WebSocket 支持，请在服务器的配置文件中添加 `websocket` 配置块，如下所示：

```text
websocket {
    # 指定监听 websocket 连接的主机和端口
    #
    # listen: "host:port"

    # 也可以使用单独的参数配置，
    # 即 host 和 port。
    #
    # host: "hostname"
    port: 443

    # 可选选项，在集群中，这将指定向通过 websocket 连接的客户端通告的 host:port。
    #
    # advertise: "host:port"

    # 默认需要 TLS 配置
    #
    tls {
      cert_file: "/path/to/cert.pem"
      key_file: "/path/to/key.pem"
    }

    # 对于测试环境，可以通过显式设置此选项为 `true` 来禁用 TLS 要求
    #
    # no_tls: true

    # [CORS 选项](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS )。
    #
    # 重要！此选项仅当 HTTP 请求存在 Origin 头时使用，这是 Web 浏览器的情况。如果不存在 Origin 头，将不执行此检查。
    #
    # 当设置为 `true` 时，HTTP origin 头必须与请求的主机名匹配。
    # 默认为 `false`。
    #
    # same_origin: true

    # [CORS 选项](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS )。
    #
    # 重要！此选项仅当 HTTP 请求存在 Origin 头时使用，这是 Web 浏览器的情况。如果不存在 Origin 头，将不执行此检查。
    #
    # 接受的来源列表。当为空且 `same_origin` 为 `false` 时，允许来自任何来源的客户端连接。
    # 此列表指定客户端请求 Origin 头唯一接受的值。
    # 主机和端口必须匹配。按照约定，"http://" URL 中缺少 TCP 端口将是端口 80
    # 对于 "https://" 会是 443。
    #
    # allowed_origins [
    #    "http://www.example.com"
    #    "https://www.other-example.com"
    # ]

    # 这启用服务器中对压缩 websocket 帧的支持。
    # 要使用压缩，服务器和客户端都必须支持它。
    #
    # compression: true

    # 这是服务器读取客户端请求和将响应写回客户端的总允许时间。
    # 这包括 TLS 握手所需的时间。
    #
    # handshake_timeout: "2s"

    # HTTP cookie 的名称，如果存在，服务器会将其视作客户端 JWT。
    # 如果客户端在 CONNECT 协议中指定了 JWT，则忽略此选项。
    # cookie 应由 HTTP 服务器设置，如[此处](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)所述。
    # 当作为某些认证机制的结果生成 NATS `Bearer` 客户端 JWT 时，此设置很有用。
    # 在正确认证后，HTTP 服务器可以为用户颁发 JWT，该 JWT 被安全设置，防止意外地 js 脚本访问。
    # 注意这些 JWT 必须是 [NATS JWT](https://docs.nats.io/nats-server/configuration/securing_nats/jwt)。
    #
    # jwt_cookie: "my_jwt_cookie_name"

    # 当 websocket 客户端连接时，如果没有提供用户名，将在认证阶段默认使用此用户名。
    # 如果指定，这将覆盖主配置文件中定义的任何 `no_auth_user` 值，仅针对 websocket 客户端。
    # 注意这与在运营商模式下运行服务器不兼容。
    #
    # no_auth_user: "my_username_for_apps_not_providing_credentials"

    # 请参阅下文以了解限制 websocket 客户端为特定用户的正常方式。
    # 如果配置中没有指定用户，这个简单的配置块允许你覆盖主部分中等效块中配置的值。
    #
    # authorization {
    #     # 如果指定了此选项，客户端必须提供相同的用户名
    #     # 和密码才能连接。
    #     # username: "my_user_name"
    #     # password: "my_password"
    #
    #     # 如果指定了此选项，CONNECT 中的 password 字段必须
    #     # 与此令牌匹配。
    #     # token: "my_token"
    #
    #     # 这将覆盖主授权配置块中的超时设定。为了与主授权配置块的一致性，这表示为秒数。
    #     # timeout: 2.0
    #}
}
```

## WebSocket 用户授权

### 认证

NATS 支持通过 WebSocket 连接的客户端使用不同形式的认证：

- 用户名/密码
- 令牌
- NKEYs
- 客户端证书
- JWTs

你可以在[此处](https://github.com/nats-io/nats.ws#authentication)获得更多关于通过 WebSocket 连接的应用程序如何使用这些不同认证形式的信息。

### 限制连接类型

配置用户时的一个新字段允许你限制特定用户允许的连接类型。

考虑此配置：

```text
authorization {
  users [
    {user: foo password: foopwd, permission: {...}}
    {user: bar password: barpwd, permission: {...}}
  ]
}
```

如果 WebSocket 客户端要连接并使用用户名 `foo` 和密码 `foopwd`，它将被接受。现在假设你希望 WebSocket 客户端仅在使用用户名 `bar` 和密码 `barpwd` 连接时才被接受，那么你将使用选项 `allowed_connection_types` 来限制哪些类型的连接可以绑定到此用户。

```text
authorization {
  users [
    {user: foo password: foopwd, permission: {...}}
    {user: bar password: barpwd, permission: {...}, allowed_connection_types: ["WEBSOCKET"]}
  ]
}
```

选项 `allowed_connection_types`（也可以命名为 `connection_types` 或 `clients`）如你所见是一个列表，你可以允许几种类型的客户端。假设你希望用户 `bar` 接受标准 NATS 客户端和 WebSocket 客户端，你将这样配置用户：

```text
authorization {
  users [
    {user: foo password: foopwd, permission: {...}}
    {user: bar password: barpwd, permission: {...}, allowed_connection_types: ["STANDARD", "WEBSOCKET"]}
  ]
}
```

缺少 `allowed_connection_types` 意味着允许所有类型的连接（这是默认行为）。

当前可能的值是：

* `STANDARD`
* `WEBSOCKET`
* `LEAFNODE`
* `MQTT`

## 叶子节点连接

你可以配置远程叶子节点连接，使其连接到 WebSocket 端口而不是叶子节点端口。请参阅[叶子节点](../leafnodes/leafnode_conf.md#使用-websocket-协议连接)部分。

## Docker

在 Docker 上运行时，默认情况下不启用 WebSocket，因此你必须创建一个具有最小条目的配置文件，例如：

```text
websocket 
{
     port: 8080
     no_tls: true
}
```

假设配置存储在 `/tmp/nats.conf` 中，你可以按如下方式启动 docker：

```bash
docker run -it --rm  -v /tmp:/container -p 8080:8080 nats -c /container/nats.conf
```