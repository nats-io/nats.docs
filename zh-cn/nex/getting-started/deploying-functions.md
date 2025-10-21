# 部署 Nex 函数

将函数部署到 Nex 的操作与部署服务一样简单。无论是 WebAssembly 类型的函数还是 JavaScript 类型的函数，其模式都是一样的。

## 函数触发器
使用 Nex 函数时，您可以指定一组触发主题（可以包含通配符），用于激活这些函数。例如，假设您已经部署了一个计算器服务，您可能选择了 `calc.*` 作为触发主题。这意味着当一个主题为 `calc.add` 的消息进入时，您的函数将会被调用。该函数会接收到主题名 `calc.add` 和 core NATS 消息中提供的有效载荷。

如果您的函数返回了有效载荷，并且您是通过 request（而不是 publish）来触发该函数，那么返回的有效载荷将会作为响应体提供。

虽然主题触发机制非常灵活且功能强大，但我们也在积极思考其他可能的触发方式，例如流上的拉取型消费者、键值存储/对象存储上的观察者等。

## 部署 JavaScript 函数
让我们部署我们的 JavaScript 函数。我们将使用触发主题 `js.echo`，以便与 WebAssembly 函数区分开来。
执行以下命令（您的 JavaScript 文件路径可能会有所不同）：

```
$ nex devrun /home/kevin/echofunction.js --trigger_subject=js.echo
Reusing existing issuer account key: /home/kevin/.nex/issuer.nk
Reusing existing publisher xkey: /home/kevin/.nex/publisher.xk
🚀 Workload 'echofunctionjs' accepted. You can now refer to this workload with ID: cmjud7n52omhlsa377cg on node NC7PXV2DLGXC4LTVM7W7MXYL3WVQFA345IFKJOMYA5ZDZMACLZ53NIIL
```

让我们确认一下该函数是否正常运行，并且可以在正确的主题上被触发：

```
$ nats req js.echo 'heya'
09:40:33 Sending request on "js.echo"
09:40:33 Received with rtt 2.600724ms
"heya"
```

同时，让我们确认一下该工作负载是否在节点上可见（您的节点 ID 可能不同）：

```
$ nex node info NC7PXV2DLGXC4LTVM7W7MXYL3WVQFA345IFKJOMYA5ZDZMACLZ53NIIL
NEX Node Information

         Node: NC7PXV2DLGXC4LTVM7W7MXYL3WVQFA345IFKJOMYA5ZDZMACLZ53NIIL
         Xkey: XDKZMOZKVBXSY3YXPIXEFKGPML75PLD7APFHZ474EOCILZDQGPZSXJNZ
      Version: 0.0.1
       Uptime: 2m26s
         Tags: nex.arch=amd64, nex.cpucount=8, nex.os=linux, simple=true

Memory in kB:

           Free: 32,354,208
      Available: 55,985,740
          Total: 63,883,232

Workloads:

             Id: cmjud7n52omhlsa377cg
        Healthy: true
        Runtime: 2m26s
           Name: echofunctionjs
    Description: Workload published in devmode
```

一切运行正常，太棒了！

## 部署 WebAssembly 函数
现在让我们部署我们的 WebAssembly 函数。如果您没有在本地构建自己的函数到 .wasm，可以在 [Github 仓库](https://github.com/synadia-io/nex/tree/main/examples/wasm/echofunction) 的 `examples` 文件夹中下载一个名为 `echofunction.wasm` 的文件。

部署这个文件的方式与刚才部署 JavaScript 函数一样：

```
$ nex devrun ../examples/wasm/echofunction/echofunction.wasm --trigger_subject=wasm.echo
Reusing existing issuer account key: /home/kevin/.nex/issuer.nk
Reusing existing publisher xkey: /home/kevin/.nex/publisher.xk
🚀 Workload 'echofunctionwasm' accepted. You can now refer to this workload with ID: cmjudmn52omhlsa377d0 on node NC7PXV2DLGXC4LTVM7W7MXYL3WVQFA345IFKJOMYA5ZDZMACLZ53NIIL
```

现在我们应该能够通过 `wasm.echo` 主题触发该函数：

```
$ nats req wasm.echo 'hello'
09:45:24 Sending request on "wasm.echo"
09:45:24 Received with rtt 42.867014ms
hellowasm.echo
```

正如预期的那样，我们得到了与触发主题 `wasm.echo` 连接在一起的有效载荷。我们可以再次运行 `nats node info` 命令，并看到我们的两个函数工作负载：

```
$ nex node info NC7PXV2DLGXC4LTVM7W7MXYL3WVQFA345IFKJOMYA5ZDZMACLZ53NIIL
NEX Node Information

         Node: NC7PXV2DLGXC4LTVM7W7MXYL3WVQFA345IFKJOMYA5ZDZMACLZ53NIIL
         Xkey: XDKZMOZKVBXSY3YXPIXEFKGPML75PLD7APFHZ474EOCILZDQGPZSXJNZ
      Version: 0.0.1
       Uptime: 7m31s
         Tags: nex.arch=amd64, nex.cpucount=8, nex.os=linux, simple=true

Memory in kB:

           Free: 32,280,180
      Available: 56,018,344
          Total: 63,883,232

Workloads:

             Id: cmjud7n52omhlsa377cg
        Healthy: true
        Runtime: 7m31s
           Name: echofunctionjs
    Description: Workload published in devmode
  
             Id: cmjudmn52omhlsa377d0
        Healthy: true
        Runtime: 6m31s
           Name: echofunctionwasm
    Description: Workload published in devmode
```

恭喜您，您现在已经学会使用 Nex 部署完整的服务（编译为静态二进制文件）、JavaScript 函数、WebAssembly 函数啦。使用 Nex 将您的应用程序部署为服务与函数的组合既快速又简单，并为您愉快地部署分布式应用程序做好了准备。