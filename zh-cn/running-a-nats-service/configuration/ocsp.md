# OCSP Stapling

_自 NATS 服务器版本 2.3 起支持_

对于具有 [status_request Must-Staple 标志](https://datatracker.ietf.org/doc/html/rfc6961) 的证书，默认支持 [OCSP Stapling](https://en.wikipedia.org/wiki/OCSP_stapling)。

当证书配置了 OCSP Must-Staple 时，NATS 服务器将从证书中存在的已配置 OCSP 响应者 URL 获取装订。例如，给定具有以下配置的证书：

```text
[ ext_ca ]
...                                                                           
authorityInfoAccess = OCSP;URI:http://ocsp.example.net:80
tlsfeature = status_request
...
```

NATS 服务器将向 OCSP 响应者发出请求以获取新的装订，然后在 TLS 握手期间将其呈现给服务器接受的任何 TLS 连接。

可以通过在 NATS 配置文件的顶级设置以下标志来显式启用或禁用 OCSP Stapling：

```text
ocsp: false
```

**注意**：当 OCSP Stapling 被禁用时，即使证书具有 Must-Staple 标志，NATS 服务器也不会请求装订。

## 高级配置

默认情况下，NATS 服务器将在 OCSP `auto` 模式下运行。在此模式下，服务器仅在证书中配置了 Must-Staple 标志时获取装订。

还有其他 OCSP 模式控制是否应强制执行 OCSP 以及如果证书使用已撤销的装订运行，服务器是否应关闭的行为：

| Mode | Description | Server shutdowns when revoked |
| :--- | :--- | :--- |
| auto | Enables OCSP Stapling when the certificate has the must staple/status_request flag | No |
| must | Enables OCSP Staping when the certificate has the must staple/status_request flag | Yes |
| always | Enables OCSP Stapling for all certificates | Yes |
| never | Disables OCSP Stapling even if must staple flag is present \(same as `ocsp: false`\) | No |

例如，在以下 OCSP 配置中，模式设置为 `must`。这意味着仅对启用了 Must-Staple 标志的证书获取装订，但在撤销的情况下，服务器将关闭而不是使用已撤销的装订运行。
在此配置中，`url` 还将覆盖可能在证书中配置的 OCSP 响应者 URL。

```text
ocsp {
  mode: must
  url: "http://ocsp.example.net"
}
```

如果始终需要装订，无论证书的配置如何，你可以强制执行以下行为：

```text
ocsp {
  mode: always
  url: "http://ocsp.example.net"
}
```

## 装订缓存

当在 NATS 服务器中配置了 `store_dir` 时，该目录将用于在磁盘上缓存装订，以允许服务器在重新启动时恢复，而无需在装订仍然有效时向 OCSP 响应者发出另一个请求。

```text
ocsp: true

store_dir: "/path/to/store/dir"

tls {
    cert_file: "configs/certs/ocsp/server-status-request-url.pem"
    key_file: "configs/certs/ocsp/server-status-request-url-key.pem"
    ca_file: "configs/certs/ocsp/ca-cert.pem"
    timeout: 5
}
```

如果启用了 JetStream，则将重用相同的 `store_dir` 并自动启用磁盘缓存。
