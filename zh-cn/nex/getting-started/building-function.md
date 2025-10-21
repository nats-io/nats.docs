# 构建 Nex 函数
Nex 函数可以被视为类似于云函数或 “lambda” 函数。Nex 函数是短生命周期的，并且会在外部触发时执行。

Nex 函数有两种类型：**JavaScript** 和 **WebAssembly**。在本页，我们将分别介绍这两种类型的函数。

{% hint style="warning" %}
1. 由于整个项目正在快速向 1.0 版本迈进，Nex 函数也在经历快速变化。无论是 JavaScript 函数还是 WebAssembly 函数，随着我们为它们提供宿主服务（见下文）并利用 Wasm 工作负载的组件模型，其 API 都将发生一些变化。请务必经常查看 `examples` 文件夹，以了解是否有任何更新。  
2. 请留意本翻译最后更新时间，并在需要时看最新的英文版。
{% endhint %}

## 编写 JavaScript 函数
编写一个 JavaScript 函数非常简单。只需编写一个能够完成所需功能的函数即可。例如，以下是一个在 Nex 中运行的 JavaScript 函数，它只是简单地“回显”传入的请求：

```javascript
(subject, payload) => {
  console.log(subject);
  return payload;
};
```

该函数接收两个参数：

* `subject` - 触发函数的主题（我们将在下一节部署函数中详细讨论触发主题）
* `payload` - 与触发一起提供的原始二进制负载

该函数返回一个二进制负载作为响应（如果没有响应，则返回空负载）。需要注意的是，Nex 函数能引发的副作用非常有限。随着“宿主服务”（将在稍后讨论）功能的逐步完善，JavaScript 函数将能够利用 NATS 的更多核心功能和 JetStream。

尽管你只需部署单个 `.js` 文件，但你可自由使用任何你喜欢的测试和构建工具。

## 编写 WebAssembly 函数
为了支持尽可能多的语言和运行时环境，Nex 的 [WebAssembly](https://webassembly.org/) 函数遵循使用 [WASI](https://wasi.dev/) 的 [命令模式](https://wasmcloud.com/blog/webassembly-patterns-command-reactor-library#the-command-pattern)。这意味着每次触发发生时，模块的 `main`（或 `start` 或 `_start`，取决于你的视角）函数会被执行，输入通过 `stdin` 提供，而函数的响应则通过 `stdout` 返回。

兼容 Nex 的 WebAssembly 函数可以用任何能够生成独立的 `wasm32-wasi` 模块（不依赖主机系统上的 JavaScript）的语言编写。例如，如果你用 Go 编写一个 wasm 函数，并直接或间接导入了 `syscall/js`，那么你的函数将无法正常工作。

在本节中，我们将使用 Rust 语言创建一个适用于 Nex 的 WebAssembly 函数。Rust 是 WebAssembly 生态系统中最强大的语言之一。即使你尚未安装 Rust，也仍然可以继续阅读并部署下一节中预构建的模块。

首先，创建一个新的 Rust 可执行项目（而非库项目）。修改 `Cargo.toml` 文件，使其内容如下：

```toml
[package]
name = "echofunction"
version = "0.1.0"
edition = "2021"

[[bin]]
name = "echofunction"
path = "src/main.rs"
```

然后编辑 `src/main.rs` 文件，使其内容如下：

```rust
use std::{env, io::{self, Read, Write}};

fn main() {
    let args: Vec<String> = env::args().collect();

    // 当 WASI 触发执行时：
    // argv[1] 是触发的主题
    // stdin 字节是原始输入负载
    // stdout 字节是原始输出负载

    let mut buf = Vec::new();
    io::stdin().read_to_end(&mut buf).unwrap();
    
    let mut subject = args[1].as_bytes().to_vec();
    buf.append(&mut subject);

    // 这个函数只是将负载与主题连接起来并返回
    
    io::stdout().write_all(&mut buf).unwrap();
}
```

这个 Rust WebAssembly 函数会收到触发它的主题和传入的负载，并将负载与主题连接后返回。这样，在触发函数时，你可以轻松看到发生了什么。

使用以下命令将该函数编译为模块：

```
$ cargo build --target wasm32-wasi --release
```

这将在 `./target/wasm32-wasi/release` 目录下生成 `echofunction.wasm` 文件。该函数占用约 **2MB** 的空间，但可以通过公共的 wasm 工具将其压缩到 **700KB** 以下。你的可部署 WebAssembly 函数所占用的磁盘空间甚至比最小的梗还要小。

## 宿主服务
像这样的小型、快速函数非常适合用于数据转换或临时计算等任务。因此，它们很适合用作“[纯函数](https://en.wikipedia.org/wiki/Pure_function)”——即没有任何副作用的函数。

然而，并不是所有人们需要通过函数完成的任务，都可被表示为没有 I/O 或副作用的纯函数。这就是 [宿主服务](../host_services/) 的作用所在。在几乎所有云中的 FaaS 或云函数运行时环境中，通常都会提供某种 SDK，使你的函数能够访问一些基本功能。

例如，在 AWS 中部署的 Lambda 函数可以访问 AWS SDK 的一部分；Azure 和 Google 中部署的函数也是如此。即使是所谓的“边缘函数”，也能访问键值存储桶、对象存储等资源的精简优化版本。

在第一个实验性的预发布阶段，我们为函数提供了一小部分可用的服务。目前，JavaScript 函数可以访问以下宿主服务：

* Core NATS 消息传递，例如 Pub、Sub、Request
* 键值存储
* 对象存储
* HTTP 客户端

如果 WebAssembly 的 WASI 组件模型成熟到足以为开发者提供良好的体验，我们将能通过 “WASI cloud” 系列接口规范提供宿主服务。如果该组件模型在我们预期的时间范围内无法支持足够好的开发者体验，我们最终可能会为宿主服务提供自有的接口规范。

请持续关注我们的博客和社交媒体平台，以获取有关我们增强和提供更多宿主服务的最新消息。