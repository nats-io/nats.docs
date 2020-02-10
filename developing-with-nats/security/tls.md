# Encrypting and Authenticating Connections with TLS

While authentication limits which clients can connect, TLS can be used to encrypt traffic between client/server and check the server’s identity.  Additionally - in the most secure version of TLS with NATS - the server can be configured to verify the client's identity, thus authenticating it. When started in [TLS mode](../../nats-server/configuration/securing_nats/tls.md), a `nats-server` will require all clients to connect with TLS. Moreover, if configured to connect with TLS, client libraries will fail to connect to a server without TLS.

## Connecting with TLS and verify client identity

Using TLS to connect to a server that verifies the client's identity is straightforward. The client has to provide a certificate and private key. The NATS client will use these to prove it's identity to the server. For the client to verify the server's identity, the CA certificate is provided as well.

The [Java examples repository](https://github.com/nats-io/java-nats-examples/tree/master/src/main/resources) contains certificates and a server config for this example.

```bash
> nats-server -c /src/main/resources/tls_verify.conf
```

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("localhost",
    nats.ClientCert("resources/certs/cert.pem", "resources/certs/key.pem"),
    nats.RootCAs("resources/certs/ca.pem"))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Do something with the connection
```
{% endtab %}

{% tab title="Java" %}
```java
class SSLUtils {
    public static String KEYSTORE_PATH = "src/main/resources/keystore.jks";
    public static String TRUSTSTORE_PATH = "src/main/resources/cacerts";
    public static String STORE_PASSWORD = "password";
    public static String KEY_PASSWORD = "password";
    public static String ALGORITHM = "SunX509";

    public static KeyStore loadKeystore(String path) throws Exception {
        KeyStore store = KeyStore.getInstance("JKS");
        BufferedInputStream in = new BufferedInputStream(new FileInputStream(path));

        try {
            store.load(in, STORE_PASSWORD.toCharArray());
        } finally {
            if (in != null) {
                in.close();
            }
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
            Options options = new Options.Builder().
                                server("nats://localhost:4222").
                                sslContext(ctx). // Set the SSL context
                                build();
            Connection nc = Nats.connect(options);

            // Do something with the connection

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
let caCert = fs.readFileSync(caCertPath);
let clientCert = fs.readFileSync(clientCertPath);
let clientKey = fs.readFileSync(clientKeyPath);
let nc = NATS.connect({
    url: url,
    tls: {
        ca: [caCert],
        key: [clientKey],
        cert: [clientCert]
    }
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

ssl_ctx = ssl.create_default_context(purpose=ssl.Purpose.SERVER_AUTH)
ssl_ctx.load_verify_locations('ca.pem')
ssl_ctx.load_cert_chain(certfile='client-cert.pem',
                        keyfile='client-key.pem')
await nc.connect(io_loop=loop, tls=ssl_ctx)

await nc.connect(servers=["nats://demo.nats.io:4222"], tls=ssl_ctx)

# Do something with the connection.
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
      :private_key_file => './spec/configs/certs/key.pem',
      :cert_chain_file  => './spec/configs/certs/server.pem'
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

    # Set default callbacks
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

{% tab title="TypeScript" %}
```typescript
let caCert = readFileSync(caCertPath);
let clientCert = readFileSync(clientCertPath);
let clientKey = readFileSync(clientKeyPath);
let nc = await connect({
    url: url,
    tls: {
        ca: [caCert],
        key: [clientKey],
        cert: [clientCert]
    }
});
```
{% endtab %}
{% endtabs %}

## Connecting with the TLS Protocol

Clients (such as Go, Java, Javascript, Ruby and Type Script) support providing a URL containing the `tls` protocol to the NATS connect call. This will turn on TLS without the need for further code changes. However, in that case there is likely some form of default or environmental settings to allow the TLS libraries of your programming language to find certificate and trusted CAs. Unless these settings are taken into accounts or otherwise modified, this way of connecting is very likely to fail. 
