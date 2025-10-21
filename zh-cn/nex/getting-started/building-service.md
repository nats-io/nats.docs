# 构建一个 Nex 服务
构建一个旨在通过 Nex 部署的服务，与构建任何其他服务并无不同。我们对您的应用程序或其依赖项没有任何特殊要求，只需满足运行该服务的节点的沙盒化需求即可。Nex 不提供专有的 SDK、自定义构建工具，也没有复杂的依赖关系树。

如果您正在构建“云原生”或符合 [12 因素](https://12factor.net/) 的单二进制部署服务，那么在 Nex 中运行这些服务应该不会有任何问题。

按照 Nex 的理解，“服务”仅仅是一个长期运行的进程。一个服务需要启动（例如，它有一个 `main` 函数/入口点），并且需要持续运行，直到宿主环境通知它停止运行。

## 创建一个 NATS 服务
在此示例中，我们将使用 Go 来创建一个简单的可执行文件。我们将使用 [NATS 服务框架](https://natsbyexample.com/examples/services/intro/go) 来暴露一个端点，以实现服务发现。

打开您喜欢的编辑器，并编辑一个名为 `main.go` 的文件，内容如下：

```go
package main

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/nats-io/nats.go"
	services "github.com/nats-io/nats.go/micro"
)

func main() {
	ctx := context.Background()

	natsUrl := os.Getenv("NATS_URL")
	if len(strings.TrimSpace(natsUrl)) == 0 {
		natsUrl = nats.DefaultURL
	}
	fmt.Printf("Echo service using NATS url '%s'\n", natsUrl)
	nc, err := nats.Connect(natsUrl)
	if err != nil {
		panic(err)
	}

	// request handler
	echoHandler := func(req services.Request) {
		req.Respond(req.Data())
	}

	fmt.Println("Starting echo service")

	_, err = services.AddService(nc, services.Config{
		Name:    "EchoService",
		Version: "1.0.0",
		// base handler
		Endpoint: &services.EndpointConfig{
			Subject: "svc.echo",
			Handler: services.HandlerFunc(echoHandler),
		},
	})

	if err != nil {
		panic(err)
	}

	<-ctx.Done()
}
```

无论您选择如何解决依赖关系（例如，使用 `go.mod` 文件），您都需要安装 Go 的 NATS 客户端 SDK：

```
$ go get github.com/nats-io/nats.go
```

如果您已熟悉了基于 NATS 基础设施的应用程序开发，这段代码应该非常直观。我们首先根据环境变量 `NATS_URL` 指定的值建立与 NATS 服务器的连接。

接下来，我们创建一个名为 `EchoService` 的可发现服务，并在 `svc.echo` 主题上设置一个端点。这意味着我们定义的处理程序 (`echoHandler`) 将响应该主题上的请求。

## 运行我们的服务
为确保我们没有隐藏任何技巧，让我们完全不使用 Nex 来运行这个服务。在一个终端中，运行 `go run main.go` 命令；在另一个终端中，向 `svc.echo` 主题发送一个请求：

```
$ nats req svc.echo 'this is a test'
17:10:53 Sending request on "svc.echo"
17:10:53 Received with rtt 567.537µs
this is a test
```

最后，我们还需要确认该服务是否符合 NATS 服务规范的要求：

```
$ nats service ls
╭──────────────────────────────────────────────────────────────╮
│                           All Services                       │
├─────────────┬─────────┬────────────────────────┬─────────────┤
│ Name        │ Version │ ID                     │ Description │
├─────────────┼─────────┼────────────────────────┼─────────────┤
│ EchoService │ 1.0.0   │ 8GGpcCv98xgoGb5VUDRAl8 │             │
╰─────────────┴─────────┴────────────────────────┴─────────────╯
```

完美！我们的服务一切正常，而且我们无需 Nex 即可进行测试。这可能看起来是一个细微之处，但 Nex 服务 与部署方式及运行时调度机制 **_并非紧密耦合_**，这一点非常强大。

## 静态编译
虽然通过 `go run ...` 在本地测试我们的服务非常简单，但为了让我们的服务能够通过 Nex 部署，它必须是一个静态链接的可执行文件。幸运的是，Go 很容易实现这一点。

在包含 `main.go` 文件的同一目录下，运行以下 Go 命令：

```
$ CGO_ENABLED=0 go build -tags netgo -ldflags '-extldflags "-static"'
```

如果一切顺利，您将不会看到任何输出，我们可以验证下您的服务是否为正确的文件类型：

```
$ file echoservice
echoservice: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked, Go BuildID=XXFUNOXfjIEOepi2cW-o/gnDMAXpM9aha9OAEsvLi/XPLmCOsZsF3NATJ_-Zkt/71yl5VaZNDY-jsIhJkcc, with debug_info, not stripped
```

除了 Go，许多其他语言同样能够生成静态链接的二进制文件。例如，如果您使用 Rust，只需将目标设置为 `x86_64-unknown-linux-musl` 或 `aarch64-unknown-linux-musl` 即可达到相同效果。

有了静态编译后的服务，我们还需要做一件事，才能开始部署，那就是启动一个 Nex 节点进程。 