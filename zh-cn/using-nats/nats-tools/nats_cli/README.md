# nats

一个命令行工具，用于与 NATS 进行交互和管理。

此实用程序取代了过去以 `nats-sub` 和 `nats-pub` 形式命名的各种工具，增加了多项新功能，并支持完整的 JetStream 管理。

有关详细信息，请查看仓库：[github.com/nats-io/natscli](https://github.com/nats-io/natscli)。

## 安装 `nats`

请参考 [README 中的安装部分](https://github.com/nats-io/natscli?tab=readme-ov-file#installation)。

您可以在 [这里](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies)阅读有关执行策略的信息。

二进制文件也可通过 [GitHub 发布](https://github.com/nats-io/natscli/releases)获取。

## 使用 `nats`

### 获取帮助

* [NATS 命令行界面 README](https://github.com/nats-io/natscli#readme)
* `nats help`
* `nats help [<command>...]` 或 `nats [<command>...] --help`
* 记得看看速查表呀！
  * `nats cheat`
  * `nats cheat --sections`
  * `nats cheat <section>>`

### 与 NATS 交互

* `nats context`
* `nats account`
* `nats pub`
* `nats sub`
* `nats request`
* `nats reply`
* `nats bench`

### 监控 NATS

* `nats events`
* `nats rtt`
* `nats server`
* `nats latency`
* `nats governor`

### 管理和操作流

* `nats stream`
* `nats consumer`
* `nats backup`
* `nats restore`

### 管理和操作键值存储

* `nats kv`

### 获取参考信息

* `nats errors`
* `nats schema`

## 配置上下文

CLI 具有多个配置设置，这些设置可以通过命令行参数传递，也可以在环境变量中设置。

```shell
nats --help
```

输出摘录

```
...
  -s, --server=URL              NATS server urls ($NATS_URL)
      --user=USER               Username or Token ($NATS_USER)
      --password=PASSWORD       Password ($NATS_PASSWORD)
      --creds=FILE              User credentials ($NATS_CREDS)
      --nkey=FILE               User NKEY ($NATS_NKEY)
      --tlscert=FILE            TLS public certificate ($NATS_CERT)
      --tlskey=FILE             TLS private key ($NATS_KEY)
      --tlsca=FILE              TLS certificate authority chain ($NATS_CA)
      --socks-proxy=PROXY       SOCKS5 proxy for connecting to NATS server
                                ($NATS_SOCKS_PROXY)
      --colors=SCHEME           Sets a color scheme to use ($NATS_COLOR)
      --timeout=DURATION        Time to wait on responses from NATS
                                ($NATS_TIMEOUT)
      --context=NAME            Configuration context ($NATS_CONTEXT)
...
```

服务器 URL 可以使用 `--server` CLI 标志、`NATS_URL` 环境变量或通过 [NATS 上下文](./#NATS-上下文) 设定。

密码可以使用 `--password` CLI 标志、`NATS_PASSWORD` 环境变量或通过 [NATS 上下文](./#NATS-上下文) 设定。例如：如果您想创建一个脚本，提示用户输入系统用户的密码（以便该密码不会出现在 `ps` 或 `history` 中，或者您可能不想将其存储在配置文件中），然后执行一个或多个 `nats` 命令，您可以这样做：

```shell
#!/bin/bash
echo "-n" "system user password: "
read -s NATS_PASSWORD
export NATS_PASSWORD
nats server report jetstream --user system
```

### NATS 上下文

上下文是一个有名字的配置，其中存储所有这些设置。您可以指定默认上下文并在上下文之间切换。

上下文可以通过 `nats context create my_context_name` 创建，然后通过 `nats context edit my_context_name` 修改：

```json
{
  "description": "",
  "url": "nats://127.0.0.1:4222",
  "token": "",
  "user": "",
  "password": "",
  "creds": "",
  "nkey": "",
  "cert": "",
  "key": "",
  "ca": "",
  "nsc": "",
  "jetstream_domain": "",
  "jetstream_api_prefix": "",
  "jetstream_event_prefix": "",
  "inbox_prefix": "",
  "user_jwt": ""
}
```

此上下文存储在文件 `~/.config/nats/context/my_context_name.json` 中。

上下文也可以通过指定设置来创建，使用 `nats context save`：

```shell
nats context save example --server nats://nats.example.net:4222 --description 'Example.Net Server'
nats context save local --server nats://localhost:4222 --description 'Local Host' --select 
```

列出您的上下文：

```shell
nats context ls
```

```
已知上下文：

   example             Example.Net Server
   local*              Local Host
```

我们为 `local` 上下文传递了 `--select` 参数，这意味着当未设置任何内容时，它将成为默认上下文。

选择上下文：

```shell
nats context select
```

检查到服务器的往返时间（使用当前选定的上下文）：

```shell
nats rtt
```

```
nats://localhost:4222:

   nats://127.0.0.1:4222: 245.115µs
       nats://[::1]:4222: 390.239µs
```

您也可以直接指定上下文：

```shell
nats rtt --context example
```

```
nats://nats.example.net:4222:

   nats://192.0.2.10:4222: 41.560815ms
   nats://192.0.2.11:4222: 41.486609ms
   nats://192.0.2.12:4222: 41.178009ms
```

所有 `nats` 命令都支持上下文，而 `nats context` 命令具有各种用于查看、编辑和删除上下文的命令。

服务器 URL 和凭据路径可以通过 `nsc` 命令解析，例如要查找 `acme` 运营商的 `orders` 账户中的用户 `new`，可以使用以下命令：

```shell
nats context save example --description 'Example.Net Server' --nsc nsc://acme/orders/new
```

此时，服务器列表和凭据路径将通过 `nsc` 解析；如果这些在上下文中明确设置，则特定上下文配置将优先。

## 生成 bcrypt 加密密码

服务器支持使用 `bcrypt` 对密码和身份验证令牌进行哈希处理。要利用此功能，只需将配置中的明文密码替换为其 `bcrypt` 哈希值，服务器将根据需要自动使用 `bcrypt`。另请参阅：[Bcrypted Passwords](../../../running-a-nats-service/configuration/securing_nats/auth_intro/username_password.md#bcrypted-passwords)。

`nats` 实用程序有一个用于创建 `bcrypt` 哈希的命令。这可用于配置中的密码或令牌。

```shell
nats server passwd
```

```
? Enter password [? for help] **********************
? Reenter password [? for help] **********************

$2a$11$3kIDaCxw.Glsl1.u5nKa6eUnNDLV5HV9tIuUp7EHhMt6Nm9myW1aS
```

要在服务器上使用密码，将哈希添加到服务器配置文件的 authorization 部分。

```
  authorization {
    user: derek
    password: $2a$11$3kIDaCxw.Glsl1.u5nKa6eUnNDLV5HV9tIuUp7EHhMt6Nm9myW1aS
  }
```

请注意，客户端仍需提供密码的明文版本，但服务器仅存储哈希值，以便在提供密码时验证其正确性。

## 参见

使用 NATS CLI 的发布-订阅模式

{% embed url="https://www.youtube.com/watch?v=jLTVhP08Tq0" %}
使用 NATS CLI 的发布-订阅模式
{% endembed %}