# 账户信息

## 账户信息

JetStream 是多租户系统，因此您需要确认您的账户已启用 JetStream 功能且未受到限制。您可以按照以下方式查看您的限制：

```shell
nats account info
```
```text
Connection Information:
               Client ID: 8
               Client IP: 127.0.0.1
                     RTT: 178.545µs
       Headers Supported: true
         Maximum Payload: 1.0 MiB
           Connected URL: nats://localhost:4222
       Connected Address: 127.0.0.1:4222
     Connected Server ID: NCCOHA6ONXJOGAEZP4WPU4UJ3IQP2VVXEPRKTQCGBCW4IL4YYW4V4KKL
JetStream Account Information:
           Memory: 0 B of 5.7 GiB
          Storage: 0 B of 11 GiB
          Streams: 0 of Unlimited
   Max Consumers: unlimited
```

