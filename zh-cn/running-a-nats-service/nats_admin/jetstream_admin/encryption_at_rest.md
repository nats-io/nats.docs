# 静态加密

*自 NATS 服务器版本 2.3.0 起支持*

*自 NATS 服务器版本 2.11.0 起，Windows 上支持 TPM*

{% hint style="warning" %}
请注意，尽管 NATS 服务器的静态加密功能已完全支持，但我们建议在可用的情况下使用文件系统加密。

文件系统加密（尤其是由云托管服务提供的）经过优化以提高吞吐量，不会给 NATS 服务器带来负担，并且无需在 NATS 安装中进行密钥管理。

{% endhint %}

NATS 服务器可以被配置为加密消息块，包括消息头和负载。其他元数据文件也会被加密，例如流元数据文件和消费者元数据文件。

目前支持两种加密算法：

- `chachapoly` - [ChaCha20-Poly1305](https://pkg.go.dev/golang.org/x/crypto/chacha20poly1305)
- `aes` - [AES-GCM](https://pkg.go.dev/crypto/aes)

启用加密是通过服务器上的 `jetstream` [配置块](/running-a-nats-service/configuration/README.md#jetstream) 来完成的。

```text
jetstream : {
  cipher: chachapoly
  key : "6dYfBV0zzEkR3vxZCNjxmnVh/aIqgid1"
}
```

建议在运行时通过环境变量提供加密密钥，例如 `$JS_KEY`，这样密钥就不会保存在文件中。

```text
jetstream : {
  cipher: chachapoly
  key: $JS_KEY
}
```

该变量可以在环境中导出，或在服务器启动时传递。

```shell
JS_KEY="mykey" nats-server -c js.conf
```

## TPM（仅适用于 Windows）

````
jetstream {
  store_dir: nats
  max_file_store: 10G
  tpm {
          keys_file: "keys"
          encryption_password: "pwd"
  }
}
````
| Property                  | Description                                                                                                                                                                               | Default                 | Version |
| :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------- | :------ |
| `keys_file`                     |  Specifies the file where encryption keys are stored. This option is required, otherwise TPM will not be active. If the file does NOT EXIST, a new key will be dynamically created and stored in the `pcr`  | required | 2.11.0  |
| `encryption_password`                     | Password used for decrypting data in the keys file. OR, the password used to seal the dynamically created key in the TPM store. | required  | 2.11.0  |
| `srk_password`                     |  The Storage Root Key (SRK) password is used to access the TPM's storage root key. The srk password is optional in TPM 2.0. | not set  | 2.11.0  |
| `pcr`                     |  Platform Configuration Registers (PCRs). 0-16 are reserved. Pick a value from 17 to 23. |  22  | 2.11.0  | 
| `cipher`                     |   `chacha`/`chachapoly` or `aes`.                    | `chachapoly` | 2.11.0  |  


## 更改加密设置

### 在已有数据的情况下启用加密

支持在已有数据的服务器上启用加密。需要注意的是，现有未加密的消息块不会被重新加密，但任何新存储的消息块将会被加密。

如果希望对现有块进行加密，可以备份并恢复流（备份时解密，恢复时重新加密）。


### 禁用或更改密钥

如果在服务器上启用了加密，并且服务器重启时使用了不同的密钥或完全禁用了加密，服务器将无法在从存储加载消息时解密这些消息。如果发生这种情况，您会看到类似以下的日志信息：

```text
Error decrypting our stream metafile: chacha20poly1305: message authentication failed
```

请注意，这将影响 JetStream 功能，但服务器仍将支持 Core NATS 功能。

### 更改加密算法

可以更改 `cipher`，但必须使用相同的密钥。服务器将正确地使用新的加密算法加密新消息块，并使用现有加密算法解密现有消息块。

## 性能考虑因素

性能方面的考虑：正如预期的那样，加密可能会降低性能，但具体降低多少很难确定。在 MacbookPro 2.8 GHz Intel Core i7 和 SSD 上的一些性能测试中，我们观察到性能下降幅度从 1% 到超过 30% 不等。除了加密所需的 CPU 周期外，加密后的文件可能更大，导致存储或读取的数据量增加。

