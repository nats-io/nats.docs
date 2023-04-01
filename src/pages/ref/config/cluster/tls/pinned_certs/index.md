# pinned_certs

/ [config](/ref/config/index.md) / [cluster](/ref/config/config/cluster/index.md) / [tls](/ref/config/config/cluster/tls/index.md)

List of hex-encoded SHA256 of DER-encoded public key fingerprints. When present, during the TLS handshake, the
provided certificate's fingerprint is required to be present in the list, otherwise the connection will be
closed.
