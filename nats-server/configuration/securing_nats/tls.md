# Enabling TLS

The NATS server uses modern TLS semantics to encrypt client, route, and monitoring connections. Server configuration revolves around a `tls` map, which has the following properties:

| Property | Description |
| :--- | :--- |
| `cert_file` | TLS certificate file. |
| `key_file` | TLS certificate key file. |
| `ca_file` | TLS certificate authority file. When not present, default to the system trust store. |
| `cipher_suites` | When set, only the specified TLS cipher suites will be allowed. Values must match the golang version used to build the server. |
| `curve_preferences` | List of TLS cipher curves to use in order. |
| `insecure` | Skip certificate verification. **NOT Recommended** |
| `timeout` | TLS handshake [timeout](#tls-timeout) in fractional seconds. Default set to `0.5` seconds. |
| `verify` | If `true`, require and [verify](auth_intro/tls_mutual_auth.md#validating-a-client-certificate) client certificates. To support use by Browser, this option does not apply to monitoring. |
| `verify_and_map` | If `true`, require and verify client certificates and [map](auth_intro/tls_mutual_auth.md#mapping-client-certificates-to-a-user) certificate values for authentication purposes. Does not apply to monitoring either. |

The simplest configuration:

```text
tls: {
  cert_file: "./server-cert.pem"
  key_file: "./server-key.pem"
}
```

Or by using [server options](../../flags.md#tls-options):

```text
> nats-server --tls --tlscert=./server-cert.pem --tlskey=./server-key.pem
[21417] 2019/05/16 11:21:19.801539 [INF] Starting nats-server version 2.0.0
[21417] 2019/05/16 11:21:19.801621 [INF] Git commit [not set]
[21417] 2019/05/16 11:21:19.801777 [INF] Listening for client connections on 0.0.0.0:4222
[21417] 2019/05/16 11:21:19.801782 [INF] TLS required for client connections
[21417] 2019/05/16 11:21:19.801785 [INF] Server id is ND6ZZDQQDGKYQGDD6QN2Y26YEGLTH6BMMOJZ2XJB2VASPVII3XD6RFOQ
[21417] 2019/05/16 11:21:19.801787 [INF] Server is ready
```

Notice that the log indicates that the client connections will be required to use TLS. If you run the server in Debug mode with `-D` or `-DV`, the logs will show the cipher suite selection for each connected client:

```text
[22242] 2019/05/16 11:22:20.216322 [DBG] 127.0.0.1:51383 - cid:1 - Client connection created
[22242] 2019/05/16 11:22:20.216539 [DBG] 127.0.0.1:51383 - cid:1 - Starting TLS client connection handshake
[22242] 2019/05/16 11:22:20.367275 [DBG] 127.0.0.1:51383 - cid:1 - TLS handshake complete
[22242] 2019/05/16 11:22:20.367291 [DBG] 127.0.0.1:51383 - cid:1 - TLS version 1.2, cipher suite TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
```

When a `tls` section is specified at the root of the configuration, it also affects the monitoring port if `https_port` option is specified. Other sections such as `cluster` can specify a `tls` block.

## TLS Timeout

The `timeout` setting enables you to control the amount of time that a client is allowed to upgrade its connection to tls. If your clients are experiencing disconnects during TLS handshake, you'll want to increase the value, however, if you do be aware that an extended `timeout` exposes your server to attacks where a client doesn't upgrade to TLS and thus consumes resources. Conversely, if you reduce the TLS `timeout` too much, you are likely to experience handshake errors.

```text
tls: {
  cert_file: "./server-cert.pem"
  key_file: "./server-key.pem"
  # clients will fail to connect (value is too low)
  timeout: 0.0001
}
```

## Self Signed Certificates for Testing

Explaining [Public key infrastructure](https://en.wikipedia.org/wiki/Public_key_infrastructure), [Certificate Authorities \(CA\)](https://en.wikipedia.org/wiki/Certificate_authority) and [x509](https://tools.ietf.org/html/rfc5280) [certificates](https://en.wikipedia.org/wiki/Public_key_certificate) fall well outside the scope of this document. So does an explanation on how to obtain a properly trusted certificates.

If anybody outside your organization needs to connect, get certs from a public certificate authority. Think carefully about revocation and cycling times, as well as automation, when picking a CA. If arbitrary applications inside your organization need to connect, use a cert from your in-house CA. If only resources inside a specific environment need to connect, that environment might have its own dedicated automatic CA, eg in Kubernetes clusters, so use that.

**Only** for **testing** purposes does it makes sense to generate self signed certificates, even your own CA. This is a **short** guide on how to do just that and what to watch out for.

> **DO NOT USE these certificates in production!!!**

### Problems With Self Signed Certificates

#### Missing in Relevant Trust Stores

As they should, these are **not trusted** by the system your server or clients are running on.

One option is to specify the CA in every client you are using. In case you make use of `verify` and `verify_and_map` you need to specify `ca_file` in the server. If you are having a more complex setup involving cluster, gateways or leaf nodes, `ca_file` needs to be present in `tls` maps used to connect to the server with self signed certificates. While this works for server and libraries from the NATS eco system, you will experience issues when connecting with other tools such as your Browser.

Another option is to configure your system's trust store to include self signed certificate\(s\). Which trust store needs to be configured depends on what you are testing.

* This may be your OS for server and certain clients.
* The runtime environment for other clients like Java, Python or Node.js.
* Your browser for monitoring endpoints and websockets.

Please check your system's documentation on how to trust a particular self signed certificate.

#### Missing Subject Alternative Name

Another common problem is failed [identity validation](https://tools.ietf.org/html/rfc6125). The IP or DNS name to connect to needs to match a [Subject Alternative Name \(SAN\)](https://tools.ietf.org/html/rfc4985) inside the certificate. Meaning, if a client/browser/server connect via tls to `127.0.0.1`, the server needs to present a certificate with a SAN containing the IP `127.0.0.1` or the connection will be closed with a handshake error.

#### Wrong Key Usage

When generating your certificate you need to make sure to include the right purpose for which you want to use the certificate. This is encoded in [key usage](https://tools.ietf.org/html/rfc5280#section-4.2.1.3) and [extended key usage](https://tools.ietf.org/html/rfc5280#section-4.2.1.12). The necessary values for key usage depend on the ciphers used. `Digital Signature` and `Key Encipherment` are an interoperable choice.

With respect to NATS the relevant values for extended key usage are:

* `TLS WWW server authentication` - To authenticate as server for incoming connections. A NATS server will need a certificate containing this.
* `TLS WWW client authentication` - To authenticate as client for outgoing connections. Only needed when connecting to a server where `verify` or `verify_and_map` are specified. In these cases, a NATS client will need a certificate with this value. 
  * [Leaf node](../leafnodes/README.md) connections can be configured with `verify` as well. Then the connecting NATS server will have to present a certificate with this value too. Certificates containing both values are an option.
  * [Cluster](../clustering/README.md) connections always have `verify` enabled. Which server acts as client and server comes down to timing and therefore can't be individually configured. Certificates containing both values are a must.
  * [Gateway](../gateways/README.md) connections always have `verify` enabled. Unlike cluster outgoing connections can specify a separate cert. Certificates containing both values are an option that reduce configuration. 

Note that it's common practice for non-web protocols to use the `TLS WWW` authentication fields, as a matter of history those have become embedded as generic options.

### Creating Self Signed Certificates for Testing

The simplest way to generate a CA as well as client and server certificates is [mkcert](https://github.com/FiloSottile/mkcert). This zero config tool generates and installs the CA into your **local** system trust store\(s\) and makes providing SAN straight forward. Check it's [documentation](https://github.com/FiloSottile/mkcert/blob/master/README.md) for installation and your system's trust store. Here is a simple example:

Generate a CA as well as a certificate, valid for server authentication by `localhost` and the IP `::1`\(`-cert-file` and `-key-file` overwrite default file names\). Then start a NATS server using the generated certificate.

```bash
mkcert -install
mkcert -cert-file server-cert.pem -key-file server-key.pem localhost ::1
nats-server --tls --tlscert=server-cert.pem --tlskey=server-key.pem -ms 8222
```

Now you should be able to access the monitoring endpoint `https://localhost:8222` with your browser.  
`https://127.0.0.1:8222` however should result in an error as `127.0.0.1` is not listed as SAN. You will not be able to establish a connection from another computer either. For that to work you have to provide appropriate DNS and/or IP [SAN\(s\)](#missing-subject-alternative-name)

To generate certificates that work with `verify`/[`cluster`](../cluster/README.md)/[`gateway`](../gateway/README.md)/[`leaf_nodes`](../leafnodes/README.md) provide the `-client` option. It will cause the appropriate key usage for client authentication to be added. This example also adds a SAN email for usage as user name in `verify_and_map`.

```bash
mkcert -client -cert-file client-cert.pem -key-file client-key.pem localhost ::1 email@localhost
```

> Please note:
> * That client refers to connecting process, not necessarily a NATS client.
> * `mkcert -client` will generate a certificate with key usage suitable for client **and** server authentication.

Examples in this document make use of the certificates generated so far. To simplify examples using the CA certificate, copy `rootCA.pem` into the same folder where the certificates were generated. To obtain the CA certificate's location use this command:

```bash
mkcert -CAROOT
```

Once you are done testing, remove the CA from your **local** system trust store\(s\).

```text
mkcert -uninstall
```

Alternatively, you can also use [openssl](https://www.openssl.org/) to [generate certificates](https://www.digitalocean.com/community/tutorials/openssl-essentials-working-with-ssl-certificates-private-keys-and-csrs). This tool allows a lot more customization of the generated certificates. It is **more complex** and does **not manage** installation into the system trust store\(s\).

However, for inspecting certificates it is quite handy. To inspect the certificates from the above example execute these commands:

```bash
openssl x509 -noout -text -in server-cert.pem
openssl x509 -noout -text -in client-cert.pem
```

