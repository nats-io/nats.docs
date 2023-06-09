# tls

/ [Server Config](/ref/config/index.md) / [cluster](/ref/config/cluster/index.md) 

TLS configuration for securing cluster connections.
`verify` is always enabled and `cert_file` is used for
both client and server for mutual TLS.

*Reloadable*: `true`

*Types*

- `object`


## Properties

#### [`cert_file`](/ref/config/cluster/tls/cert_file/index.md)

TLS certificate file.

#### [`key_file`](/ref/config/cluster/tls/key_file/index.md)

TLS certificate key file.

#### [`ca_file`](/ref/config/cluster/tls/ca_file/index.md)

TLS certificate authority file. Defaults to system trust store.

#### [`cipher_suites`](/ref/config/cluster/tls/cipher_suites/index.md)

When set, only the specified TLS cipher suites will be allowed. Values must match the golang version used to build the server.

#### [`curve_preferences`](/ref/config/cluster/tls/curve_preferences/index.md)

List of TLS cipher curves to use in order.

#### [`insecure`](/ref/config/cluster/tls/insecure/index.md)

Skip certificate verification. This only applies to outgoing connections, NOT incoming client connections. **not recommended.**

#### [`timeout`](/ref/config/cluster/tls/timeout/index.md)

TLS handshake timeout.

Default value: `500ms`

#### [`verify`](/ref/config/cluster/tls/verify/index.md)

If true, require and verify client certificates. Does not apply to monitoring.

Default value: `false`

#### [`verify_and_map`](/ref/config/cluster/tls/verify_and_map/index.md)

If true, require and verify client certificates and map certificate values for authentication. Does not apply to monitoring.

Default value: `false`

#### [`verify_cert_and_check_known_urls`](/ref/config/cluster/tls/verify_cert_and_check_known_urls/index.md)

Only used in a non-client context where `verify` is true, such as cluster and gateway configurations.
The incoming connection's certificate x509v3 Subject Alternative Name DNS entries will be matched against
all URLs. If a match is found, the connection is accepted and rejected otherwise.

For gateways, the server will match all names in the certificate against the gateway URLs.

For clusters, the server will match all names in the certificate against the route URLs.

A consequence of this, is that dynamic cluster growth may require config changes in other clusters where this
option is true. DNS name checking is performed according to RFC6125. Only the full wildcard is supported for the
the left most domain.

#### [`connection_rate_limit`](/ref/config/cluster/tls/connection_rate_limit/index.md)



#### [`pinned_certs`](/ref/config/cluster/tls/pinned_certs/index.md)

List of hex-encoded SHA256 of DER-encoded public key fingerprints. When present, during the TLS handshake, the
provided certificate's fingerprint is required to be present in the list, otherwise the connection will be
closed.

