# verify_cert_and_check_known_urls

/ [config](/ref/config/index.md) / [leafnodes](/ref/config/config/leafnodes/index.md) / [tls](/ref/config/config/leafnodes/tls/index.md) 

Only used in a non-client context where `verify` is true, such as cluster and gateway configurations.
The incoming connection's certificate x509v3 Subject Alternative Name DNS entries will be matched against
all URLs. If a match is found, the connection is accepted and rejected otherwise.

For gateways, the server will match all names in the certificate against the gateway URLs.

For clusters, the server will match all names in the certificate against the route URLs.

A consequence of this, is that dynamic cluster growth may require config changes in other clusters where this
option is true. DNS name checking is performed according to RFC6125. Only the full wildcard is supported for the
the left most domain.

