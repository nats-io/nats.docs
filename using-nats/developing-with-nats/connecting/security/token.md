# Аутентификация по токену

Токены — это по сути случайные строки, похожие на пароль, и они могут обеспечивать простую аутентификацию в некоторых случаях. Однако токены безопасны ровно настолько, насколько они секретны, поэтому в крупных установках другие схемы аутентификации могут дать больше безопасности. Настоятельно рекомендуется использовать один из других механизмов аутентификации NATS.

Для этого примера запустите сервер так:

```bash
nats-server --auth mytoken
```

В коде используется localhost:4222, чтобы вы могли запустить сервер на своей машине и попробовать примеры.

## Подключение с токеном

{% tabs %}
{% tab title="Go" %}
```go
// Set a token
nc, err := nats.Connect("127.0.0.1", nats.Name("API Token Example"), nats.Token("mytoken"))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Do something with the connection
```
{% endtab %}

{% tab title="Java" %}
```java
Options options = new Options.Builder()
    .server("nats://demo.nats.io:4222")
    .token("mytoken") // Set a token
    .build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
const nc = await connect({
  port: ns.port,
  token: "aToK3n",
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://demo.nats.io:4222"], token="mytoken")

# Do something with the connection.
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;
using NATS.Client.Core;

await using var client = new NatsClient(new NatsOpts
{
    Url = "127.0.0.1",
    Name = "API Token Example",
    AuthOpts = new NatsAuthOpts
    {
        Token = "mytoken"
    }
});
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
NATS.start(token: "mytoken") do |nc|
  puts "Connected using token"
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetToken(opts, "mytoken");
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}

## Подключение с токеном в URL

Некоторые клиентские библиотеки позволяют передать токен как часть URL сервера в виде:

> nats://_token_@server:port

После формирования такого URL вы можете подключиться как к обычному URL.

{% tabs %}
{% tab title="Go" %}
```go
// Token in URL
nc, err := nats.Connect("mytoken@localhost")
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Do something with the connection
```
{% endtab %}

{% tab title="Java" %}
```java
Connection nc = Nats.connect("nats://mytoken@localhost:4222");//Token in URL

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
  // JavaScript doesn't support tokens in urls use the `token` option
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

await nc.connect(servers=["nats://mytoken@demo.nats.io:4222"])

# Do something with the connection.
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;
using NATS.Client.Core;

await using var client = new NatsClient(new NatsOpts
{
    // .NET client doesn't support tokens in URLs
    // use Token option instead.
    AuthOpts = new NatsAuthOpts
    {
        Token = "mytoken"
    }
});
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
NATS.start("mytoken@127.0.0.1:4222") do |nc|
  puts "Connected using token!"
end
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    s = natsOptions_SetURL(opts, "nats://mytoken@127.0.0.1:4222");
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}
