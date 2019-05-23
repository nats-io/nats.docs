# Store Encryption

The server can be configured to encrypt a message's payload when storing them, providing encryption at rest. This can be done from the command line or from the configuration file. Check `encrypt` and `encryption_key` in the [Configuring](#configuring) section.

It is recommended to provide the encryption key through the environment variable `NATS_STREAMING_ENCRYPTION_KEY` instead of `encryption_key`. If encryption is enabled and `NATS_STREAMING_ENCRYPTION_KEY` is found, this will take precedence over `encryption_key` value.

You can pass this from the command line this way:
```
$ env NATS_STREAMING_ENCRYPTION_KEY="mykey" nats-streaming-server -store file -dir datastore -encrypt
```

We currently support two ciphers for encryption: [AES](https://godoc.org/crypto/aes) and [CHACHA](https://godoc.org/golang.org/x/crypto/chacha20poly1305).
The default selected cipher depends on the platform. For ARM, we use `CHACHA`, otherwise we default to `AES`. You can always override that decision by explicitly specifying the cipher like this:
```
$ env NATS_STREAMING_ENCRYPTION_KEY="mykey" nats-streaming-server -store file -dir datastore -encrypt -encryption_cipher "CHACHA"
```
or, to select `AES`:
```
$ env NATS_STREAMING_ENCRYPTION_KEY="mykey" nats-streaming-server -store file -dir datastore -encrypt -encryption_cipher "AES"
```

Note that only message payload is encrypted, all other data stored by NATS Streaming server is not.

When running in clustering mode (see below), the server uses RAFT, which uses its own log files. Those will be encrypted too.

Starting a server with `encrypt` against a datastore that was not encrypted may result in failures when it comes to decrypt a message, which may not happen immediately upon startup. Instead,
it will happen when attempting to deliver messages to consumers. However, when possible, the server will detect if the data was not encrypted and return the data without attempting to decrypt it.
The server will also detect which cipher was used to encrypt the data and use the proper cipher to decrypt, even if this is not the currently selected cipher.

If the data is encrypted with a key and the server is restarted with a different key, the server will fail to decrypt messages when attempting to load them from the store.

Performance considerations: As expected, encryption is likely to decrease performance, but by how much is hard to define. In some performance tests on a MacbookPro 2.8 GHz Intel Core i7 with SSD, we have
observed as little as 1% decrease to more than 30%. In addition to CPU cycles required for encryption, the encrypted payload is bigger, which result in more data being stored or read.
