# natscli

A command line utility to interact with and manage NATS.

This utility replaces various past tools that were named in the form `nats-sub` and `nats-pub`, adds several new capabilities and support full JetStream management.

Check out the repo for more details: [github.com/nats-io/natscli](https://github.com/nats-io/natscli).

## Installing `nats`

For macOS:

```
> brew tap nats-io/nats-tools
> brew install nats-io/nats-tools/nats
```

For Arch Linux:

```
> yay natscli
```

For Docker:

```
docker pull synadia/nats-box:latest

docker run -ti synadia/nats-box
```

Binaries are also available as [GitHub Releases](https://github.com/nats-io/natscli/releases).

## Generating bcrypted passwords

The server supports hashing of passwords and authentication tokens using `bcrypt`. To take advantage of this, simply replace the plaintext password in the configuration with its `bcrypt` hash, and the server will automatically utilize `bcrypt` as needed.

The `nats` utility has a command for creating `bcrypt` hashes. This can be used for a password or a token in the configuration.

With `nats` installed:

```plain
> nats server passwd
? Enter password [? for help] **********************
? Reenter password [? for help] **********************

$2a$11$3kIDaCxw.Glsl1.u5nKa6eUnNDLV5HV9tIuUp7EHhMt6Nm9myW1aS
```

To use the password on the server, add the hash into the server configuration file's authorization section.

```
  authorization {
    user: derek
    password: $2a$11$3kIDaCxw.Glsl1.u5nKa6eUnNDLV5HV9tIuUp7EHhMt6Nm9myW1aS
  }
```

Note the client will still have to provide the plain text version of the password, the server however will only store the hash to verify that the password is correct when supplied.
