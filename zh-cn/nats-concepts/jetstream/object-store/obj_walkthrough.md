# 对象存储操作指南

如果你正在运行本地的 `nats-server`，请先停止它，并使用 `nats-server -js` 命令启用 JetStream 重新启动（如果尚未启用）。

然后你可以通过以下命令检查 JetStream 是否已启用：

```shell
nats account info
```

输出应类似于：

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

如果你看到如下内容，则表示 JetStream 尚未启用：

```
JetStream Account Information:

   JetStream is not supported in this account
```

## 创建对象存储桶

就像你需要创建流后才能使用它们一样，你也需要先创建一个对象存储桶。

```shell
nats object add myobjbucket
```

输出应类似于：

```
myobjbucket Object Store Status

         Bucket Name: myobjbucket
            Replicas: 1
                 TTL: unlimitd
              Sealed: false
                Size: 0 B
  Backing Store Kind: JetStream
    JetStream Stream: OBJ_myobjbucket
```

## 向存储桶中添加文件

```shell
nats object put myobjbucket ~/Movies/NATS-logo.mov
```

```
1.5 GiB / 1.5 GiB [====================================================================================]

Object information for myobjbucket > /Users/jnmoyne/Movies/NATS-logo.mov

               Size: 1.5 GiB
  Modification Time: 14 Apr 22 00:34 +0000
             Chunks: 12,656
             Digest: sha-256 8ee0679dd1462de393d81a3032d71f43d2bc89c0c8a557687cfe2787e926
```

## 通过提供名称向存储桶中添加文件

默认情况下，完整文件路径会被用作键。你可以通过 `--name` 参数显式指定键（例如相对路径）。

```shell
nats object put --name /Movies/NATS-logo.mov myobjbucket ~/Movies/NATS-logo.mov
```

```
1.5 GiB / 1.5 GiB [====================================================================================]

Object information for myobjbucket > /Movies/NATS-logo.mov

               Size: 1.5 GiB
  Modification Time: 14 Apr 22 00:34 +0000
             Chunks: 12,656
             Digest: sha-256 8ee0679dd1462de393d81a3032d71f43d2bc89c0c8a557687cfe2787e926
```

## 列出存储桶中的对象

```shell
nats object ls myobjbucket
```

```
╭───────────────────────────────────────────────────────────────────────────╮
│                              Bucket Contents                              │
├─────────────────────────────────────┬─────────┬───────────────────────────┤
│ Name                                │ Size    │ Time                      │
├─────────────────────────────────────┼─────────┼───────────────────────────┤
│ /Users/jnmoyne/Movies/NATS-logo.mov │ 1.5 GiB │ 2022-04-13T17:34:55-07:00 │
│ /Movies/NATS-logo.mov               │ 1.5 GiB │ 2022-04-13T17:35:41-07:00 │
╰─────────────────────────────────────┴─────────┴───────────────────────────╯
```


## 从存储桶中获取对象

```shell
nats object get myobjbucket ~/Movies/NATS-logo.mov
```

```
1.5 GiB / 1.5 GiB [====================================================================================]

Wrote: 1.5 GiB to /Users/jnmoyne/NATS-logo.mov in 5.68s average 279 MiB/s
```

## 从存储桶中获取对象并指定输出路径

默认情况下，文件将根据其名称（而非完整路径）存储在本地路径下。要指定输出路径，请使用 `--output` 参数。

```shell
nats object get myobjbucket --output /temp/Movies/NATS-logo.mov /Movies/NATS-logo.mov
```

```
1.5 GiB / 1.5 GiB [====================================================================================]

Wrote: 1.5 GiB to /temp/Movies/NATS-logo.mov in 5.68s average 279 MiB/s
```

## 从存储桶中移除对象

```shell
nats object rm myobjbucket ~/Movies/NATS-logo.mov
```

```
? Delete 1.5 GiB byte file myobjbucket > /Users/jnmoyne/Movies/NATS-logo.mov? Yes
Removed myobjbucket > /Users/jnmoyne/Movies/NATS-logo.mov
myobjbucket Object Store Status

         Bucket Name: myobjbucket
            Replicas: 1
                 TTL: unlimitd
              Sealed: false
                Size: 16 MiB
  Backing Store Kind: JetStream
    JetStream Stream: OBJ_myobjbucket
```

## 获取存储桶的相关信息

```shell
nats object info myobjbucket
```

```
myobjbucket Object Store Status

         Bucket Name: myobjbucket
            Replicas: 1
                 TTL: unlimitd
              Sealed: false
                Size: 1.6 GiB
  Backing Store Kind: JetStream
    JetStream Stream: OBJ_myobjbucket
```

## 监视存储桶的变化

```shell
nats object watch myobjbucket
```

```
[2022-04-13 17:51:28] PUT myobjbucket > /Users/jnmoyne/Movies/NATS-logo.mov: 1.5 GiB bytes in 12,656 chunks
[2022-04-13 17:53:27] DEL myobjbucket > /Users/jnmoyne/Movies/NATS-logo.mov
```

### 封闭存储桶

你可以封闭存储桶，这意味着不允许对该存储桶进行进一步的更改。

```shell
nats object seal myobjbucket
```

```
? Really seal Bucket myobjbucket, sealed buckets can not be unsealed or modified Yes
myobjbucket has been sealed
myobjbucket Object Store Status

         Bucket Name: myobjbucket
            Replicas: 1
                 TTL: unlimitd
              Sealed: true
                Size: 1.6 GiB
  Backing Store Kind: JetStream
    JetStream Stream: OBJ_myobjbucket
```

## 删除存储桶

使用 `nats object rm myobjbucket` 命令将删除存储桶及其所有存储的文件。