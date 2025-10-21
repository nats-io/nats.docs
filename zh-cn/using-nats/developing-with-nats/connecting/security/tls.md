# 使用 TLS 加密连接

虽然有身份验证可以限制哪些客户端能够连接，但 TLS 可用于加密客户端与服务器之间的通信，并验证服务器的身份。此外，在使用NATS的最安全版本中，服务器还可以配置为验证客户端的身份，从而实现身份验证。当以[TLS模式](../../../../running-a-nats-service/configuration/securing_nats/tls.md)启动时，`nats-server`将要求所有客户端必须使用TLS进行连接。此外，如果客户端库被配置为使用TLS连接，那么它将无法成功连接到未启用TLS的服务器上。

## 使用TLS连接并验证客户端身份

使用TLS连接到验证客户端身份的服务器非常简单。客户端需要提供证书和私钥，NATS客户端将使用这些信息向服务器证明其身份。为了使客户端能够验证服务器的身份，还需要提供CA证书。

请参考[用于测试的自签名证书](../../../../running-a-nats-service/configuration/securing_nats/tls.md#creating-self-signed-certificates-for-testing)中创建的示例证书。

```bash
nats-server --tls --tlscert=server-cert.pem --tlskey=server-key.pem --tlscacert rootCA.pem --tlsverify
```

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("localhost",
    nats.ClientCert("client-cert.pem", "client-key.pem"),
    nats.RootCAs("rootCA.pem"))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// 用连接做点事情
```
{% endtab %}

{% tab title="Java" %}
```java
// 本示例要求证书采用Java密钥库格式（.jks）。
// 可使用openssl从client-cert.pem和client-key.pem生成pkcs12文件（.p12），
// 然后使用keytool（属于Java JDK的一部分）将生成的文件导入名为keystore.jks的Java密钥库中。
// 同样地，使用keytool将CA证书rootCA.pem导入名为truststore.jks的受信任证书库中。
//
// openssl pkcs12 -export -out keystore.p12 -inkey client-key.pem -in client-cert.pem -password pass:password
// keytool -importkeystore -srcstoretype PKCS12 -srckeystore keystore.p12 -srcstorepass password -destkeystore keystore.jks -deststorepass password
//
// keytool -importcert -trustcacerts -file rootCA.pem -storepass password -noprompt -keystore truststore.jks
class SSLUtils {
    public static String KEYSTORE_PATH = "keystore.jks";
    public static String TRUSTSTORE_PATH = "truststore.jks";
    public static String STORE_PASSWORD = "password";
    public static String KEY_PASSWORD = "password";
    public static String ALGORITHM = "SunX509";

    public static KeyStore loadKeystore(String path) throws Exception {
        KeyStore store = KeyStore.getInstance("JKS");
        BufferedInputStream in = new BufferedInputStream(new FileInputStream(path));
        try {
            store.load(in, STORE_PASSWORD.toCharArray());
        } finally {
            in.close();
        }

        return store;
    }

    public static KeyManager[] createTestKeyManagers() throws Exception {
        KeyStore store = loadKeystore(KEYSTORE_PATH);
        KeyManagerFactory factory = KeyManagerFactory.getInstance(ALGORITHM);
        factory.init(store, KEY_PASSWORD.toCharArray());
        return factory.getKeyManagers();
    }

    public static TrustManager[] createTestTrustManagers() throws Exception {
        KeyStore store = loadKeystore(TRUSTSTORE_PATH);
        TrustManagerFactory factory = TrustManagerFactory.getInstance(ALGORITHM);
        factory.init(store);
        return factory.getTrustManagers();
    }

    public static SSLContext createSSLContext() throws Exception {
        SSLContext ctx = SSLContext.getInstance(Options.DEFAULT_SSL_PROTOCOL);
        ctx.init(createTestKeyManagers(), createTestTrustManagers(), new SecureRandom());
        return ctx;
    }
}

public class ConnectTLS {
    public static void main(String[] args) {

        try {
            SSLContext ctx = SSLUtils.createSSLContext();
            Options options = new Options.Builder()
                .server("nats://localhost:4222")
                .sslContext(ctx) // 设置SSL上下文
                .build();
            Connection nc = Nats.connect(options);

            // 用连接做点事情

            nc.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// 可用的tls选项取决于使用的JavaScript运行时，请查阅相关客户端的文档以获取具体细节
// 以下示例展示的是Node.js客户端
const nc = await connect({
  port: ns.port,
  debug: true,
  tls: {
    caFile: caCertPath,
    keyFile: clientKeyPath,
    certFile: clientCertPath,
  },
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

ssl_ctx = ssl.create_default_context(purpose=ssl.Purpose.SERVER_AUTH)
ssl_ctx.load_verify_locations('rootCA.pem')
ssl_ctx.load_cert_chain(certfile='client-cert.pem',
                        keyfile='client-key.pem')
await nc.connect(io_loop=loop, tls=ssl_ctx)

await nc.connect(servers=["nats://demo.nats.io:4222"], tls=ssl_ctx)

# 用连接做点事情。
```
{% endtab %}

{% tab title="C#" %}
```csharp
// dotnet add package NATS.Net
using NATS.Net;
using NATS.Client.Core;

await using var client = new NatsClient(new NatsOpts
{
    TlsOpts = new NatsTlsOpts
    {
        CaFile = "rootCA.pem",
        KeyFile = "client-key.pem",
        CertFile = "client-cert.pem",
    }
});
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
EM.run do

  options = {
    :servers => [
      'nats://localhost:4222',
    ],
    :tls => {
      :private_key_file => 'client-key.pem',
      :cert_chain_file  => 'client-cert.pem',
      :ca_file => 'rootCA.pem'
    }
  }

  NATS.connect(options) do |nc|
    puts "#{Time.now.to_f} - Connected to NATS at #{nc.connected_server}"

    nc.subscribe("hello") do |msg|
      puts "#{Time.now.to_f} - Received: #{msg}"
    end

    nc.flush do
      nc.publish("hello", "world")
    end

    EM.add_periodic_timer(0.1) do
      next unless nc.connected?
      nc.publish("hello", "hello")
    end

    # 设置默认回调
    nc.on_error do |e|
      puts "#{Time.now.to_f } - Error: #{e}"
    end

    nc.on_disconnect do |reason|
      puts "#{Time.now.to_f} - Disconnected: #{reason}"
    end

    nc.on_reconnect do |nc|
      puts "#{Time.now.to_f} - Reconnected to NATS server at #{nc.connected_server}"
    end

    nc.on_close do
      puts "#{Time.now.to_f} - Connection to NATS closed"
      EM.stop
    end
  end
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
    s = natsOptions_LoadCertificatesChain(opts, "client-cert.pem", "client-key.pem");
if (s == NATS_OK)
    s = natsOptions_LoadCATrustedCertificates(opts, "rootCA.pem");
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// 销毁已创建的对象
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}

## 使用TLS协议连接

客户端（例如 Go、Java、JavaScript、Ruby 和 Type Script）支持向 NATS connect 调用提供包含 `tls` 协议的 URL。这将启用TLS，而无需进一步修改代码。然而，在这种情况下，可能需要某种形式的默认或环境设置，以允许编程语言的TLS库找到证书和受信任的CA。除非考虑这些设置或进行其他修改，否则这种方式的连接很可能失败。

# 参考资料
* [Java中的OCSP Stapling](https://nats.io/blog/java-ocsp-stapling/)