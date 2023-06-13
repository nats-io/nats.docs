# tls

TLS configuration for client and HTTP monitoring.

*Reloadable*: Yes

*Types*

- `object`


## Properties

| Name | Description | Default | Reloadable |
| :--- | :---------- | :------ | :--------- |
| [cert_file](/ref/config/tls/cert_file) | TLS certificate file. | `-` | Yes |
| [key_file](/ref/config/tls/key_file) | TLS certificate key file. | `-` | Yes |
| [ca_file](/ref/config/tls/ca_file) | TLS certificate authority file. Defaults to system trust store. | `-` | Yes |
| [cipher_suites](/ref/config/tls/cipher_suites) | When set, only the specified TLS cipher suites will be allowed. Values must match the golang version used to build the server. | `-` | Yes |
| [curve_preferences](/ref/config/tls/curve_preferences) | List of TLS cipher curves to use in order. | `-` | Yes |
| [insecure](/ref/config/tls/insecure) | Skip certificate verification. This only applies to outgoing connections, NOT incoming client connections. **not recommended.** | `-` | Yes |
| [timeout](/ref/config/tls/timeout) | TLS handshake timeout. | ``500ms`` | Yes |
| [verify](/ref/config/tls/verify) | If true, require and verify client certificates. Does not apply to monitoring. | ``false`` | Yes |
| [verify_and_map](/ref/config/tls/verify_and_map) | If true, require and verify client certificates and map certificate values for authentication. Does not apply to monitoring. | ``false`` | Yes |
| [verify_cert_and_check_known_urls](/ref/config/tls/verify_cert_and_check_known_urls) | Only used in a non-client context where `verify` is true, such as cluster and gateway configurations. The incoming connection's certificate x509v3 Subject Alternative Name DNS entries will be matched against all URLs. If a match is found, the connection is accepted and rejected otherwise.  For gateways, the server will match all names in the certificate against the gateway URLs.  For clusters, the server will match all names in the certificate against the route URLs.  A consequence of this, is that dynamic cluster growth may require config changes in other clusters where this option is true. DNS name checking is performed according to RFC6125. Only the full wildcard is supported for the the left most domain. | `-` | Yes |
| [connection_rate_limit](/ref/config/tls/connection_rate_limit) |  | `-` | Yes |
| [pinned_certs](/ref/config/tls/pinned_certs) | List of hex-encoded SHA256 of DER-encoded public key fingerprints. When present, during the TLS handshake, the provided certificate's fingerprint is required to be present in the list, otherwise the connection will be closed. | `-` | Yes |
