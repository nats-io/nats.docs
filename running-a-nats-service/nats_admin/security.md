# Managing operators, accounts and users JWTs and Nkeys

If you are using the [JWT](/running-a-nats-service/configuration/securing_nats/jwt/README.md) model of authentication to secure your NATS infrastructure you can administer authentication and authorization without having to change the servers' configuration files.

You can use the [`nsc`](/using-nats/nats-tools/nsc/README.md) CLI tool to manage identities. Identities take the form of nkeys. Nkeys are a public-key signature system based on Ed25519 for the NATS ecosystem.
The nkey identities are associated with NATS configuration in the form of a JSON Web Token (JWT). The JWT is digitally signed by the private key of an issuer forming a chain of trust. The nsc tool creates and manages these identities and allows you to deploy them to a JWT account server, which in turn makes the configurations available to nats-servers.

You can also use [`nk`](https://github.com/nats-io/nkeys#readme) CLI tool and library to manage keys.

## Creating, updating and managing JWTs programatically

You can create, update and delete accounts and users programmatically using the following libraries:

* Golang: see [NKEYS](https://github.com/nats-io/nkeys) and [JWT](https://github.com/nats-io/jwt).
* Java: see [NKey.java](https://github.com/nats-io/nats.java/blob/main/src/main/java/io/nats/client/NKey.java) and [JwtUtils.java](https://github.com/nats-io/nats.java/blob/main/src/main/java/io/nats/client/support/JwtUtils.java)

### Examples

#### User JWTs

[User creation in Golang](https://docs.nats.io/running-a-nats-service/nats_admin/security/jwt#automated-sign-up-services-jwt-and-nkey-libraries)

#### Account JWTs

Golang example:

```
func createAccount() {
	kp, err := nkeys.CreateAccount()
	if err != nil {
		log.Println((err))
	}

	pub, err := kp.PublicKey()
	if err != nil {
		log.Println((err))
	}

	nac := jwt.NewAccountClaims(pub)
	// Set account claims
	nac.Name = "account name"

	// Load operator key pair
	operatorSeed := "operator seed goes here"
	operatorKP, err := nkeys.FromSeed([]byte(operatorSeed))
	if err != nil {
		log.Println((err))
	}

	// Sign the account claims and convert it into a JWT string
	jwt, err := nac.Encode(operatorKP)
	if err != nil {
		log.Println((err))
	}

	// Push account JWT to the NATS server
	nc, err := nats.Connect("nats-server-url")
	if err := nc.Publish("$SYS.REQ.CLAIMS.UPDATE", []byte(jwt)); err != nil {
		log.Println((err))
	}
	nc.Flush()
}
```

Note: to delete accounts use the `"$SYS.REQ.CLAIMS.DELETE"` and make sure to enable JWT deletion in your nats-server resolver `config allow_delete: true` in the `resolver` stanza of the server configuration.