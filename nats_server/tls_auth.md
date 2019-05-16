## TLS Authentication

TLS authentication allows a client to authenticate by presenting a TLS certificate. TLS Certificate authentication checks the client certificate’s `Subject Alternative Name` for an email address. Alternatively, you can map fields found in the client certificate’s `Subject`. If the mapped value is matched to the client's certificate, authentication succeeds.

### Enabling TLS Certificate Authentication

To enable TLS Certificate authentication, set the `verify_and_map` configuration option on the server's `tls` configuration:

```yaml
tls {
  cert_file: "./server_cert.pem"
  key_file:  "./server_key.pem"
  ca_file:   "./ca.pem"
  
  # Require a client certificate and map user ids
  verify_and_map: true
}
```

### Inspecting Certificate Contents

You can easily inspect a TLS certificate using `openssl`:

```text
> openssl x509 -in client-id-auth-cert.pem -text
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 17268173637974047931 (0xefa4e06edb353cbb)
    Signature Algorithm: sha1WithRSAEncryption
        Issuer: C=US, ST=CA, L=San Francisco, O=Apcera Inc, OU=nats.io, CN=localhost/emailAddress=derek@nats.io
        Validity
            Not Before: Jan 25 04:40:50 2019 GMT
            Not After : Jan 24 04:40:50 2023 GMT
        Subject: C=US, ST=CA, L=Los Angeles, O=Synadia Communications Inc., OU=NATS.io, CN=localhost/emailAddress=derek@nats.io
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
                Modulus:
                    00:9c:ec:a1:c8:51:5e:0c:85:da:a4:2c
…
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            X509v3 Subject Alternative Name: 
                DNS:localhost, IP Address:127.0.0.1, email:derek@nats.io
            X509v3 Extended Key Usage: 
                TLS Web Client Authentication
    Signature Algorithm: sha1WithRSAEncryption
…
```

Here's one more example, this time showing a certificate that has multiple Subject Alternative Name (SAN):

```text
openssl x509 -in /tmp/client.pem -text
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:
            2e:9c:da:46:3a:31:05:d9:fa:1a:7c:fd:28:15:06:8d:9b:9c:76:89
    Signature Algorithm: sha256WithRSAEncryption
        Issuer: OU=NATS.io, CN=www.nats.io
        Validity
            Not Before: Apr 19 04:38:00 2019 GMT
            Not After : Apr 17 04:38:00 2024 GMT
        Subject: CN=www.nats.io
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
                Modulus:
                    00:db:64:6b:38:85:ae:e1:9b:e9:69:1d:56:91:a2:
...
                    45:3d:56:6b:01:52:02:0f:32:89:cd:8f:50:97:83:
                    fc:e3
                Exponent: 65537 (0x10001)
        X509v3 extensions:
            X509v3 Key Usage: critical
                Digital Signature, Key Encipherment
            X509v3 Extended Key Usage:
                TLS Web Client Authentication
            X509v3 Basic Constraints: critical
                CA:FALSE
            X509v3 Subject Key Identifier:
                0C:75:6D:8B:34:34:D4:65:04:65:69:E3:7D:77:52:B8:FD:32:53:00
            X509v3 Authority Key Identifier:
                keyid:0C:1B:A8:58:3A:01:C9:7F:49:43:E1:D5:0F:FF:1C:DA:BC:80:E7:B7

            X509v3 Subject Alternative Name:
                DNS:app.nats.dev, DNS:*.app.nats.dev
    Signature Algorithm: sha256WithRSAEncryption
         23:31:20:fb:db:9f:c8:e1:da:4c:81:0e:52:cf:50:b3:05:e1:
...
         47:d0:94:60:18:f3:d7:59:5a:ab:9d:62:8e:f9:bb:ff:6e:b3:
         3f:32:c0:21
...
```

### NATS Server Configuration

The `authorization` section of the nats-server config can specify an email (when matching values in the `Subject Alternative Name` or specific fields in the `Subject` respectively:

```yaml
authorization {
  users = [
    {user: “derek@nats.io”},
    {user: “OU=nats.io”},
    {user: “*.example.nats.io”}
  ]
}
```

TLS certificate authentication is available for clients as well as for cluster configurations.

### Client TLS Configuration

Client TLS configuration using the various client libraries are documented in [Encrypting Connections with TLS](https://nats.io/documentation/writing_applications/secure_connection).

Keen eyes will notice that there is no new configuration. The burden of configuration is all in the server to expose one or more details about the client's TLS certificate. Client simply needs to provide a client-side certificate.

