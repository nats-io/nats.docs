# mkpasswd

The server supports hashing of passwords and authentication tokens using `bcrypt`. To take advantage of this, simply replace the plaintext password in the configuration with its `bcrypt` hash, and the server will automatically utilize `bcrypt` as needed.

A utility for creating `bcrypt` hashes is included with the nats-server distribution \(`util/mkpasswd.go`\). Running it with no arguments will generate a new secure password along with the associated hash. This can be used for a password or a token in the configuration.

## Installing `mkpasswd`

If you have [go installed](https://golang.org/doc/install), you can easily install the `mkpasswd` tool by doing:

```text
> go get github.com/nats-server/util/mkpasswd
```

Alternatively, you can:

```text
> git clone git@github.com:nats-io/nats-server
> cd nats-server/util/mkpasswd
> go install mkpasswd.go
```

## Generating bcrypted passwords

With `mkpasswd` installed:

```text
> mkpasswd
pass: #IclkRPHUpsTmACWzmIGXr
bcrypt hash: $2a$11$3kIDaCxw.Glsl1.u5nKa6eUnNDLV5HV9tIuUp7EHhMt6Nm9myW1aS
```

If you already have a password selected, you can supply the `-p` flag on the command line, enter your desired password, and a `bcrypt` hash will be generated for it:

```text
> mkpasswd -p
Enter Password: *******
Reenter Password: ******
bcrypt hash: $2a$11$3kIDaCxw.Glsl1.u5nKa6eUnNDLV5HV9tIuUp7EHhMt6Nm9myW1aS
```

To use the password on the server, add the hash into the server configuration file's authorization section.

```text
  authorization {
    user: derek
    password: $2a$11$3kIDaCxw.Glsl1.u5nKa6eUnNDLV5HV9tIuUp7EHhMt6Nm9myW1aS
  }
```

Note the client will still have to provide the plain text version of the password, the server however will only store the hash to verify that the password is correct when supplied.

