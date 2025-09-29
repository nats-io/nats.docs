# 启动一个节点
如果我们已经通过了启动前检查，那么启动一个Nex节点就像将 `nex node` 命令指向已检查的配置文件一样简单。

## 超级用户权限
`nex`节点进程为了设置[CNI](https://www.cni.dev/)网络并启动`firecracker`二进制文件，会进行一系列安全的内核调用。虽然可能可以手动创建一个具有适当权限的用户，从而无需使用`sudo`，但在开发过程中，使用`sudo`可能是最简单的方法。


## 节点启动
启动新节点进程的命令是`node up`。你可以在这里指定许多选项，也可以在配置文件中设置选项。所有这些细节都可以在参考部分找到。

```
$ sudo ./nex node up --config=/home/kevin/simple.json
INFO[0000] Established node NATS connection to: nats://127.0.0.1:4222 
INFO[0000] Loaded node configuration from '/home/kevin/simple.json' 
INFO[0000] Virtual machine manager starting             
INFO[0000] Internal NATS server started                  client_url="nats://0.0.0.0:41339"
INFO[0000] Use this key as the recipient for encrypted run requests  public_xkey=XDJJVJLRTWBIOHEEUPSNAAUACO6ZRW4WP65MXMGOX2WBGNCELLST5TWI
INFO[0000] NATS execution engine awaiting commands       id=NCOBPU3MCEA7LF6XADFD4P74CHW2OL6GQZYPPRRNPDSBNQ5BJPFHHQB5 version=0.0.1
INFO[0000] Called startVMM(), setting up a VMM on /tmp/.firecracker.sock-370707-cmjg61n52omq8dovolmg 
INFO[0000] VMM metrics disabled.                        
INFO[0000] refreshMachineConfiguration: [GET /machine-config][200] getMachineConfigurationOK  &{CPUTemplate: MemSizeMib:0xc0004ac108 Smt:0xc0004ac113 TrackDirtyPages:false VcpuCount:0xc0004ac100} 
INFO[0000] PutGuestBootSource: [PUT /boot-source][204] putGuestBootSourceNoContent  
INFO[0000] Attaching drive /tmp/rootfs-cmjg61n52omq8dovolmg.ext4, slot 1, root true. 
INFO[0000] Attached drive /tmp/rootfs-cmjg61n52omq8dovolmg.ext4: [PUT /drives/{drive_id}][204] putGuestDriveByIdNoContent  
INFO[0000] Attaching NIC tap0 (hwaddr 5a:65:8e:fa:7f:25) at index 1 
INFO[0000] startInstance successful: [PUT /actions][204] createSyncActionNoContent  
INFO[0000] SetMetadata successful                       
INFO[0000] Machine started                               gateway=192.168.127.1 hosttap=tap0 ip=192.168.127.6 nats_host=192.168.127.1 nats_port=41339 netmask=ffffff00 vmid=cmjg61n52omq8dovolmg
INFO[0000] Adding new VM to warm pool                    ip=192.168.127.6 vmid=cmjg61n52omq8dovolmg
INFO[0001] Received agent handshake                      message="Host-supplied metadata" vmid=cmjg61n52omq8dovolmg
```

这看起来可能有些冗长，但其中大部分信息都是有用的。

首先你会看到节点与`127.0.0.1:4222`上的 NATS 建立了连接。这是 _控制平面_ 连接，例如，Nex远程管理命令就通过这种连接发出。这不应与各个工作负载使用的 NATS 连接混淆，因为出于安全原因，这两者必须是不同的连接。

## 加密环境变量
节点输出日志中的接下来两行也提供了重要信息：
```
INFO[0000] Use this key as the recipient for encrypted run requests  public_xkey=XDJJVJLRTWBIOHEEUPSNAAUACO6ZRW4WP65MXMGOX2WBGNCELLST5TWI
INFO[0000] NATS execution engine awaiting commands       id=NCOBPU3MCEA7LF6XADFD4P74CHW2OL6GQZYPPRRNPDSBNQ5BJPFHHQB5 version=0.0.1
```
首先，你会看到一个**Xkey**，这是用于加密发送到特定节点的数据的 _目标公钥_。它用于加密 与工作负载部署请求一起提供的环境变量。不过别担心，`nex` CLI 会为你处理好这些。

## 填充虚拟机池
接下来，在节点的日志输出中你会看到类似下面的一行：
```
INFO[0000] Machine started                               gateway=192.168.127.1 hosttap=tap0 ip=192.168.127.6 nats_host=192.168.127.1 nats_port=41339 netmask=ffffff00 vmid=cmjg61n52omq8dovolmg
```
这表明我们实际上已经启动了一个 Firecracker 虚拟机，并且出于信息和调试目的，我们让它输出了网关IP地址、tap设备名称、内部NATS主机、内部NATS端口以及虚拟机的ID。

Nex节点进程维护着一个“热”虚拟机池，其大小可以在节点配置文件中进行配置。当你发出工作部署请求时，下一个可用的热虚拟机将从池中取出，并将工作分发到该虚拟机上。

## 就绪指示器
日志输出中最重要的一条信息可能是成功完成的 _握手_ 指示。每次我们尝试将虚拟机添加到池中时，运行在虚拟机内部的**agent**都会尝试与主机节点进程建立联系。如果这一交换成功，你会看到以下消息：

```
INFO[0001] Received agent handshake                      message="Host-supplied metadata" vmid=cmjg61n52omq8dovolmg
```

如果没有收到这条消息，而是看到一个表示超时或握手失败的错误，节点将会终止。如果节点无法正确分配虚拟机，就没有理由继续运行下去。

## 查询节点
当这个节点仍在运行时，打开另一个终端并执行以下`nex`命令：

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
这是所有已发现节点的汇总信息。任何给定的NATS基础设施可以根据需要运行任意数量的Nex节点，位于任意位置和集群中。

现在让我们继续部署我们的echo服务。