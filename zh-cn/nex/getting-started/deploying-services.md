# 部署 Nex 服务
使用 Nex 部署服务有多种方法。本指南将介绍最简单的方法 `devrun`，它假设您正在开发环境中使用。有关完整的生产环境部署选项，请参阅参考部分或查看 CLI 的扩展帮助文本。

首先确保您的节点仍在运行，并通过 `nex` 命令确认其可被发现：

```
$ nex node ls
╭─────────────────────────────────────────────────────────────────────────────────────────╮
│                                   NATS Execution Nodes                                  │
├──────────────────────────────────────────────────────────┬─────────┬────────┬───────────┤
│ ID                                                       │ Version │ Uptime │ Workloads │
├──────────────────────────────────────────────────────────┼─────────┼────────┼───────────┤
│ NCOBPU3MCEA7LF6XADFD4P74CHW2OL6GQZYPPRRNPDSBNQ5BJPFHHQB5 │ 0.0.1   │ 10m15s │         0 │
╰──────────────────────────────────────────────────────────┴─────────┴────────┴───────────╯
```

## 发送部署请求
我们通过向特定节点发送部署请求（最终等同于“运行”服务）来启动服务。当我们使用 `devrun` 命令时，CLI 会自动选择第一个发现的节点作为目标，使操作更加简便。

在调用 `devrun` 时，我们需要准备静态链接的二进制文件。部署工作负载还需要发布者密钥和加密 **xkey**，但如果您尚未创建这些密钥，`devrun` 会为您生成。

如您所见，我们构建的 echo 服务需要设置环境变量 `NATS_URL`。要在第一个可用的 Nex 节点上启动 echo 服务并提供环境变量，执行以下命令（您的 `echoservice` 文件路径可能有所不同）：

```
$ nex devrun ../examples/echoservice/echoservice nats_url=nats://192.168.127.1:4222
Reusing existing issuer account key: /home/kevin/.nex/issuer.nk
Reusing existing publisher xkey: /home/kevin/.nex/publisher.xk
🚀 Workload 'echoservice' accepted. You can now refer to this workload with ID: cmji29n52omrb71g07a0 on node NBS3Y3NWXLTFNC73XMVD6USFJF2H5QXTLEJQNOPEBPYDUDVB5YYYZOGI
```

这里有几个重要的信息。首先，我们重用了现有的密钥。如果您是第一次运行工作负载，您会看到这两个密钥被创建。其次，我们收到了目标节点的确认，其中包含机器/工作负载 ID。

地址 `192.168.127.1` 是 _主机_（即运行 `nex` 的主机网络）的 IP 地址，由运行在 firecracker VM 内的程序（来宾）所看到。我们将其作为默认值，因为它在开发过程中非常方便，但请注意，如果您提供了自定义的 CNI 配置，您的环境中实际使用的 IP 地址可能会有所不同。

让我们再次运行之前使用的命令，以测试我们的服务。

```
$ nats micro ls
╭──────────────────────────────────────────────────────────────╮
│                      All Micro Services                      │
├─────────────┬─────────┬────────────────────────┬─────────────┤
│ Name        │ Version │ ID                     │ Description │
├─────────────┼─────────┼────────────────────────┼─────────────┤
│ EchoService │ 1.0.0   │ NsMaTbN7u5ZPUNN47bSEI6 │             │
╰─────────────┴─────────┴────────────────────────┴─────────────╯
```

我们可以像之前一样测试该服务：

```
nats req svc.echo 'hey'
19:40:22 Sending request on "svc.echo"
19:40:22 Received with rtt 446.27µs
hey
```

现在，让我们查询单个执行节点，查看其中的工作负载（请注意，您的节点 ID 将与下面的不同）：

```
$ nex node info NBS3Y3NWXLTFNC73XMVD6USFJF2H5QXTLEJQNOPEBPYDUDVB5YYYZOGI
NEX Node Information

         Node: NBS3Y3NWXLTFNC73XMVD6USFJF2H5QXTLEJQNOPEBPYDUDVB5YYYZOGI
         Xkey: XASQSWNSIKHM5MDKDOGPSPGBA3V6JMETMIJK2YTXKAJZNMAFKXER5RUK
      Version: 0.0.1
       Uptime: 8m47s
         Tags: nex.arch=amd64, nex.cpucount=8, nex.os=linux, simple=true

Memory in kB:

           Free: 33,545,884
      Available: 56,529,644
          Total: 63,883,232

Workloads:

             Id: cmji29n52omrb71g07a0
        Healthy: true
        Runtime: 8m47s
           Name: echoservice
    Description: Workload published in devmode
```

为了证明我们并未干扰工作负载的正常运行，我们可以获取服务统计信息，看到它确实仍在跟踪请求计数：

```
$ nats micro info EchoService
Service Information

          Service: EchoService (NsMaTbN7u5ZPUNN47bSEI6)
      Description: 
          Version: 1.0.0

Endpoints:

               Name: default
            Subject: svc.echo
        Queue Group: q

Statistics for 1 Endpoint(s):

  default Endpoint Statistics:

           Requests: 1 in group q
    Processing Time: 15µs (average 15µs)
            Started: 2024-01-16 19:40:09 (7m46s ago)
             Errors: 0
```
就是这样！恭喜您，您已经成功运行了一个 Nex 节点，它随时可以接受并运行任何类型的工作负载！在本指南的下一节中，我们将创建、部署和管理函数。为了保持操作简单，建议在整个指南过程中保持运行 Nex 节点。