# nk

`nk` is a command line tool that generates `nkeys`. NKeys are a highly secure public-key signature system based on [Ed25519](https://ed25519.cr.yp.to/).

With NKeys the server can verify identity without ever storing secrets on the server. The authentication system works by requiring a connecting client to provide its public key and digitally sign a challenge with its private key. The server generates a random challenge with every connection request, making it immune to playback attacks. The generated signature is validated a public key, thus proving the identity of the client. If the public key validation succeeds, authentication succeeds.

> NKey is an awesome replacement for token authentication, because a connecting client will have to prove it controls the private key for the authorized public key.

## Installing nk

To get started with NKeys, you’ll need the `nk` tool from [https://github.com/nats-io/nkeys/tree/master/nk](https://github.com/nats-io/nkeys/tree/master/nk) repository. If you have _go_ installed, enter the following at a command prompt:

```bash
go get github.com/nats-io/nkeys/nk
```

## Generating NKeys and Configuring the Server

To generate a _User_ NKEY:

```shell
nk -gen user -pubout
```
Example output
```text
SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY
UDXU4RCSJNZOIQHZNWXHXORDPRTGNJAHAHFRGZNEEJCPQTT2M7NLCNF4
```

The first output line starts with the letter `S` for _Seed_. The second letter `U` stands for _User_. Seeds are private keys; you should treat them as secrets and guard them with care.

The second line starts with the letter `U` for _User_, and is a public key which can be safely shared.

