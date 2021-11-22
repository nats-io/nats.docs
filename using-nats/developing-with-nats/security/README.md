# Securing Connections

NATS provides several forms of security, authentication, authorization and isolation. You can turn on authentication which limits access to the NATS system. Accounts allow for isolation of a subject space and groups of applications. Authorization can be used to limit individual users access to specific subjects for publish and subscribe operations. TLS can be used to encrypt all traffic between clients and the NATS system. Finally, TLS can be used to verify client identities using client certificates. By combining all of these methods you can protect access to the system and to all message flows.

The client doesn't have control over access controls, but clients do provide the configurations required to authenticate with the system, bind to an account, and to require TLS.

