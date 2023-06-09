# pinned_certs

/ [Server Config](/ref/config/index.md) / [gateway](/ref/config/gateway/index.md) / [tls](/ref/config/gateway/tls/index.md) 

List of hex-encoded SHA256 of DER-encoded public key fingerprints. When present, during the TLS handshake, the
provided certificate's fingerprint is required to be present in the list, otherwise the connection will be
closed.

*Reloadable*: `true`

*Types*

- `string`


