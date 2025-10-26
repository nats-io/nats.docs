# 键值存储操作指南

键值存储 是 JetStream 的一项功能，因此我们需要通过以下命令确认它是否已启用：

```shell
nats account info
```

如果返回如下信息：

```
JetStream Account Information:

   JetStream is not supported in this account
```

则需要启用 JetStream。

## 前提条件：启用 JetStream

如果您正在运行本地的 `nats-server`，请停止它，并使用 `nats-server -js` 参数重新启动以启用 JetStream（如果尚未完成此步骤）。

然后，您可以使用以下命令检查 JetStream 是否已启用：

```shell
nats account info
```

```
Connection Information:

               Client ID: 6
               Client IP: 127.0.0.1
                     RTT: 64.996µs
       Headers Supported: true
         Maximum Payload: 1.0 MiB
           Connected URL: nats://127.0.0.1:4222
       Connected Address: 127.0.0.1:4222
     Connected Server ID: ND2XVDA4Q363JOIFKJTPZW3ZKZCANH7NJI4EJMFSSPTRXDBFG4M4C34K

JetStream Account Information:

           Memory: 0 B of Unlimited
          Storage: 0 B of Unlimited
          Streams: 0 of Unlimited
        Consumers: 0 of Unlimited 
```

## 创建键值存储桶

“键值存储桶”类似于流（stream），您需要先创建它才能使用，例如通过 `nats kv add <存储桶名称>`：

```shell
nats kv add my-kv
```

```
my_kv Key-Value Store Status

         Bucket Name: my-kv
         History Kept: 1
        Values Stored: 0
           Compressed: false
   Backing Store Kind: JetStream
          Bucket Size: 0 B
  Maximum Bucket Size: unlimited
   Maximum Value Size: unlimited
          Maximum Age: unlimited
     JetStream Stream: KV_my-kv
              Storage: File
```

## 存储一个值

现在我们已经创建了一个存储桶，可以为特定的键分配或“put”一个值：

```shell
nats kv put my-kv Key1 Value1
```

该命令返回键的值 `Value1`。

## 获取一个值

我们可以获取键 "Key1" 对应的值：

```shell
nats kv get my-kv Key1
```

```
my-kv > Key1 created @ 12 Oct 21 20:08 UTC

Value1
```

## 删除一个值

您可以通过以下命令随时删除一个键及其对应的值：

```shell
nats kv del my-kv Key1
```

删除不存在的键是安全的（请务必检查这一点！）。

## 原子操作

键值存储还可以用于并发设计模式，例如信号量（semaphores），通过使用原子的“create”和“update”操作。

例如，一个客户端想要独占使用某个文件时，可以通过 `create` 一个键来锁定该文件，键的值为文件名，然后在使用完文件后删除该键。为了提高容错性，客户端可以为包含该键的存储桶（`bucket`）设置超时时间。客户端还可以使用带有修订版本号的 `update` 操作来保持存储桶活跃。

更新操作也可以用于更细粒度的并发控制，有时世人称其为“乐观锁”，在这种情况下，多个客户端可以尝试执行任务，但只有一个客户端能够成功完成。

### 创建（即独占锁定）
使用“create”操作创建一个锁或信号量：
```shell
nats kv create my-sem Semaphore1 Value1
```
只有一个“create”操作可以成功。尊重先来后到原则。所有并发尝试都会导致错误，直到该键被删除：
```shell
nats kv create my-sem Semaphore1 Value1
nats: error: nats: wrong last sequence: 1: key exists
```

### 使用 CAS 更新（即乐观锁）
我们还可以通过附加参数“revision”原子地“update”一个键，这种操作也称为 CAS（比较并交换）：

```shell
nats kv update my-sem Semaphore1 Value2 13
```

第二次尝试使用相同的修订版本号 13 将失败：

```shell
nats kv update my-sem Semaphore1 Value2 13
nats: error: nats: wrong last sequence: 14
```

## 监视

键值存储的一项特殊功能是可以监视存储桶或存储桶中的特定键，并实时接收存储中变化的通知。

对于上面的例子，运行 `nats kv watch my-kv`。这会启动对刚才那个存储桶的监视。默认情况下，键值存储桶的历史记录大小为 1，因此它只记住最后一次更改。在我们的例子中，监视器应该会看到键 "Key1" 对应的值被删除：

```shell
nats kv watch my-kv
```

```
[2021-10-12 13:15:03] DEL my-kv > Key1
```

如果我们同时更改“my-kv”的值：

```shell
nats kv put my-kv Key1 Value2
```

监视器将看到这一更改：

```shell
[2021-10-12 13:25:14] PUT my-kv > Key1: Value2
```

## 清理

当您完成使用存储桶后，可以通过 `rm` 命令删除存储桶及其资源：

```shell
nats kv rm my-kv
```