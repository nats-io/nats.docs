# Go 语言中的高级连接与自定义拨号器

Go 的 NATS 客户端提供了一个 [CustomDialer](https://godoc.org/github.com/nats-io/go-nats#CustomDialer) 选项，允许您自定义与 NATS 服务器的连接逻辑，而无需修改客户端内部代码。例如，假设您希望客户端使用 `context` 包来调用 `DialContext`，并能够通过设置截止时间（deadline）取消与 NATS 的连接，那么您可以按照以下方式定义一个 Dialer 实现：

```go
package main

import (
    "context"
    "log"
    "net"
    "time"

    "github.com/nats-io/nats.go"
)

type customDialer struct {
    ctx             context.Context
    nc              *nats.Conn
    connectTimeout  time.Duration
    connectTimeWait time.Duration
}

func (cd *customDialer) Dial(network, address string) (net.Conn, error) {
    ctx, cancel := context.WithTimeout(cd.ctx, cd.connectTimeout)
    defer cancel()

    for {
        log.Println("Attempting to connect to", address)
        if ctx.Err() != nil {
            return nil, ctx.Err()
        }

        select {
        case <-cd.ctx.Done():
            return nil, cd.ctx.Err()
        default:
            d := &net.Dialer{}
            if conn, err := d.DialContext(ctx, network, address); err == nil {
                log.Println("Connected to NATS successfully")
                return conn, nil
            } else {
                time.Sleep(cd.connectTimeWait)
            }
        }
    }
}
```

通过上述拨号器实现，NATS 客户端将在上下文仍然有效的情况下，多次尝试连接到 NATS 服务器：

```go
func main() {
    // 父级上下文用于取消整个连接/重连操作。
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    var err error
    var nc *nats.Conn
    cd := &customDialer{
        ctx:             ctx,
        connectTimeout:  10 * time.Second,
        connectTimeWait: 1 * time.Second,
    }
    opts := []nats.Option{
        nats.SetCustomDialer(cd),
        nats.ReconnectWait(2 * time.Second),
        nats.ReconnectHandler(func(c *nats.Conn) {
            log.Println("Reconnected to", c.ConnectedUrl())
        }),
        nats.DisconnectHandler(func(c *nats.Conn) {
            log.Println("Disconnected from NATS")
        }),
        nats.ClosedHandler(func(c *nats.Conn) {
            log.Println("NATS connection is closed.")
        }),
        nats.NoReconnect(),
    }
    go func() {
        nc, err = nats.Connect("127.0.0.1:4222", opts...)
    }()

WaitForEstablishedConnection:
    for {
        if err != nil {
            log.Fatal(err)
        }

        // 等待上下文被取消（可能是由于超时或成功建立连接）...
        select {
        case <-ctx.Done():
            break WaitForEstablishedConnection
        default:
        }

        if nc == nil || !nc.IsConnected() {
            log.Println("Connection not ready")
            time.Sleep(200 * time.Millisecond)
            continue
        }
        break WaitForEstablishedConnection
    }
    if ctx.Err() != nil {
        log.Fatal(ctx.Err())
    }

    for {
        if nc.IsClosed() {
            break
        }
        if err := nc.Publish("hello", []byte("world")); err != nil {
            log.Println(err)
            time.Sleep(1 * time.Second)
            continue
        }
        log.Println("Published message")
        time.Sleep(1 * time.Second)
    }

    // 断开连接并刷新待发送的消息
    if err := nc.Drain(); err != nil {
        log.Println(err)
    }
    log.Println("Disconnected")
}
```

