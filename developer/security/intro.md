# Securing Connections

NATS provides several forms of security for your messages. First, you can turn on authorization which limits access to the NATS server. Second, access to specific subjects can be controlled. Third, you can use TLS to encrypt traffic between clients and the server. Finally, TLS can be used to verify client identities using certificates. By combining all of these methods you can protect access to data and data in motion.

The client doesn't have control over access controls, but clients do provide the configurations required to authenticate with the server and to turn on TLS.