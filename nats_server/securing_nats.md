# Securing NATS

The nats-server provides several forms of security:

- Connections can be _encrypted_ with TLS
- Client connections can require _authentication_
- Clients can require _authorization_ for subjects the publish or subscribe to



## Server TLS Configuration

TLS server configuration revolves around two options:

- `cert_file` - the server's certificate
- `key_file` - the server's key file


You can configure tls on the configuration file:
```
tls: {
	cert_file: "./server-cert.pem"
	key_file: "./server-key.pem"
}
```

Or by using [server options](./flags.md#tls-options):
```
> nats-server --tls --tlscert=./server-cert.pem --tlskey=./server-key.pem
```

More advanced configurations require additional options:

- `ca_file` - a certificate file providing the trust chain for the certificate authority (CA). Used to validate client certificates.
- `verify` - set to `true` if you want to verify client certs against the `ca_file` certificate.