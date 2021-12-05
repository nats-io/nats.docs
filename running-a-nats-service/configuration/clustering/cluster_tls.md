# TLS Authentication in clusters

When setting up clusters, all servers in the cluster, if using TLS, will both verify the connecting endpoints and the server responses. So certificates are checked in [both directions](/running-a-nats-service/configuration/securing_nats/tls.md#wrong-key-usage). Certificates can be configured only for the server's cluster identity, keeping client and server certificates separate from cluster formation.

TLS Mutual Authentication _is the only way_ of securing routes.

```
cluster {
  listen: 127.0.0.1:4244

  tls {
    # Route cert
    cert_file: "./configs/certs/srva-cert.pem"
    # Private key
    key_file:  "./configs/certs/srva-key.pem"
    # Optional certificate authority verifying connected routes
    # Required when we have self-signed CA, etc.
    ca_file:   "./configs/certs/ca.pem"
  }
  # Routes are actively solicited and connected to from this server.
  # Other servers can connect to us if they supply the correct credentials
  # in their routes definitions from above.
  routes = [
    nats-route://127.0.0.1:4246
  ]
}
```
