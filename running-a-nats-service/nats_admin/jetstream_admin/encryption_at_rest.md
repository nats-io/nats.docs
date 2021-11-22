# Encryption at Rest

_Supported since NATS server version 2.3_

The NATS server can be configured to encrypt message blocks when storing them, providing encryption at rest. This can be enabled through configuration. For these examples, assume the file is named `js.conf` and is in the local directory of the NATS server. We normally recommend file system encryption rather than JetStream encryption at rest.

```text
jetstream : {
    key : “mykey”
    store_dir: datastore
}
```

It is recommended to provide the encryption key through an environment variable, such as `JS_KEY` so it will not be persisted in a file.

```text
jetstream : {
    key: $JS_KEY
    store_dir: datastore
}
```

You can pass this from the command line this way:

```shell
env JS_KEY="mykey" nats-server -c js.conf
```

We currently support two ciphers for encryption: ChaChaPoly20 and [XChaChaPoly1305](https://godoc.org/golang.org/x/crypto/chacha20poly1305). The default selected cipher depends on the platform.

Note that message blocks are encrypted which includes message headers and payloads. Other metadata files are encrypted as well, such as the stream metadata file and consumer metadata files.

Starting a server with encryption enabled against a datastore that was not encrypted may result in failures when it comes to decrypting message blocks, which may not happen immediately upon startup. Instead, it will happen when attempting to deliver messages to consumers. However, when possible, the server will detect if the data was not encrypted and return the data without attempting to decrypt it.

If the data is encrypted with a key and the server is restarted with a different key, the server will fail to decrypt messages when attempting to load them from the store. The server will still be active to support core NATS functionality. If this happens, you’ll see log messages like the following:

```text
Error decrypting our stream metafile: chacha20poly1305: message authentication failed
```

Performance considerations: As expected, encryption is likely to decrease performance, but by how much is hard to define. In some performance tests on a MacbookPro 2.8 GHz Intel Core i7 with SSD, we have observed as little as 1% decrease to more than 30%. In addition to CPU cycles required for encryption, the encrypted files may be larger, which results in more data being stored or read.

