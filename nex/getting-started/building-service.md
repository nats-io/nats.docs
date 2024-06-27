# Building a Nex Service
Building a service destined for deployment via Nex is just like building any other service. We don't make any demands of your application or its dependencies, only that it meet the sandboxing requirements of the node on which it will run. There's no proprietary SDK, no custom build tools, no complicated dependency tree.

If you're building "cloud native" or [12 factor](https://12factor.net/) services as single-binary deployments, you should have no trouble running them in Nex.

A _service_, as understood by Nex, is nothing more than a long-running process. A service needs to start (e.g. it has a `main` function/entrypoint) and it needs to continue running until the host environment tells it to shut down.

## Creating a NATS Service
For this example, we're going to use Go to create a simple executable. We'll use the [NATS services framework](https://natsbyexample.com/examples/services/intro/go) to expose an endpoint for service discovery.

Open up your favorite editor and edit a `main.go` file with the following content: 

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

However you choose to satisfy the dependencies (e.g. with a `go.mod` file), you'll need the Go NATS client SDK:

```
$ go get github.com/nats-io/nats.go
```

The code is pretty straightforward if you're already used to building applications atop NATS infrastructure. We establish a connection to a NATS server as indicated by the `NATS_URL` environment variable.

Next, we create a discoverable _service_ called `EchoService` with an endpoint on the `svc.echo` subject. This means that the handler we've defined (`echoHandler`) will respond to requests on that subject.

## Running our Service
To make sure that there are no cards up our proverbial sleeves, let's run this service without using Nex at all. In one terminal, issue a `go run main.go` command, while in another terminal, make a request on the `svc.echo` subject:

```
$ nats req svc.echo 'this is a test'
17:10:53 Sending request on "svc.echo"
17:10:53 Received with rtt 567.537µs
this is a test
```

Finally, let's also make sure that this service is behaving properly according to the NATS services specification:

```
$ nats micro ls
╭──────────────────────────────────────────────────────────────╮
│                      All Micro Services                      │
├─────────────┬─────────┬────────────────────────┬─────────────┤
│ Name        │ Version │ ID                     │ Description │
├─────────────┼─────────┼────────────────────────┼─────────────┤
│ EchoService │ 1.0.0   │ FKIuiivKgSB8VWyjDYBpEc │             │
╰─────────────┴─────────┴────────────────────────┴─────────────╯
```

Perfect! Our service is doing everything it's supposed to, and we don't need Nex to test it. This might seem like a subtle point, but it's incredibly powerful that Nex services are **_not tightly coupled_** to their means of deployment or scheduling runtime.

## Static Compilation
While it's easy enough to test our service locally via `go run ...`, in order for our service to be deployable via Nex, it needs to be a statically linked executable. Thankfully, Go makes this easy.

In the same directory as your `main.go`, run the following Go command:

```
$ CGO_ENABLED=0 go build -tags netgo -ldflags '-extldflags "-static"'
```

If everything went well, you should see no output, but you'll be able to verify that your service is the right kind of file:

```
$ file echoservice
echoservice: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked, Go BuildID=XXFUNOXfjIEOepi2cW-o/gnDMAXpM9aha9OAEsvLi/XPLmCOsZsF3NATJ_-Zkt/71yl5VaZNDY-jsIhJkcc, with debug_info, not stripped
```

In addition to Go, many other languages are just as capable of producing statically linked binaries. For example, if you're using Rust you can just set your target to `x86_64-unknown-linux-musl` or `aarch64-unknown-linux-musl` for the same effect.

With our statically compiled service in hand, we have one more thing to do before we can start deploying, and that's starting a Nex node process.