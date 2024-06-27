# Building a Nex Function
Nex functions can be thought of as similar to cloud functions or "lambdas". Nex functions are short-lived and are executed in response to some external trigger. 

There are two kinds of Nex functions: **JavaScript** and **WebAssembly**. We'll take a look at both of those in this section of the guide.

{% hint style="warning" %}
Nex functions are undergoing rapid change as we bring the entire project closer toward a 1.0. Both JavaScript functions and WebAssembly functions will experience a number of API changes as we provide host services (see below) to both and leverage the component model for Wasm workloads. Make sure you check the `examples` folder frequently to see if anything has changed.
{% endhint %}

## Writing a JavaScript Function
Writing a JavaScript function is as easy as it sounds. Write the function that does what you need it to do and you're ready to go. For example, here's a JavaScript function that works in Nex and simply "echoes" the incoming request:

```javascript
(subject, payload) => {
  console.log(subject);
  return payload;
};
```

Here the function is passed two parameters:

* `subject` - The subject on which the function was triggered (we'll cover trigger subjects in the next section on deployment)
* `payload` - The raw binary payload that was supplied along with the trigger

The function returns a binary payload to be used as the response (or an empty payload for no response). Note that as it stands, the function can produce very few side effects. As we grow the "host services" (discussed shortly) functionality, JavaScript functions will be able to leverage more of NATS's core functionality and JetStream.

While you'll only be deploying the single `.js` file, you're free to use whatever other testing and build tools you like.
 
## Writing a WebAssembly Function
In order to support the largest possible number of languages and runtimes, Nex's [WebAssembly](https://webassembly.org/) functions follow the [command pattern](https://wasmcloud.com/blog/webassembly-patterns-command-reactor-library#the-command-pattern) using [WASI](https://wasi.dev/). This means that the module's `main` (or `start` or `_start` depending on your perspective) function is executed every time a trigger occurs and input is supplied via `stdin` and the function's response is provided via `stdout`.

Nex-compatible WebAssembly functions can be written in any language that can generate a freestanding `wasm32-wasi` module that has _no host JavaScript requirements_. For example, if you're writing a wasm function in Go and you've imported `syscall/js` directly or transitively, your function isn't going to work.

In this section we're going to create a WebAssembly function for Nex using Rust, one of the most well-tooled languages in the WebAssembly ecosystem. Don't worry if you don't have Rust installed, you can still follow along and deploy a pre-built module in the next section.

Create a new Rust _executable_ project (not library). Modify the `Cargo.toml` file to read as follows:

```toml
[package]
name = "echofunction"
version = "0.1.0"
edition = "2021"

[[bin]]
name = "echofunction"
path = "src/main.rs"
```

Now edit `src/main.rs` to have the following contents:

```rust
use std::{env, io::{self, Read, Write}};

fn main() {
    let args: Vec<String> = env::args().collect();

    // When a WASI trigger executes:
    // argv[1] is the subject on which it was triggered
    // stdin bytes is the raw input payload
    // stdout bytes is the raw output payload

    let mut buf = Vec::new();
    io::stdin().read_to_end(&mut buf).unwrap();
    
    let mut subject = args[1].as_bytes().to_vec();
    buf.append(&mut subject);

    // This just returns the payload concatenated with the
    // subject
    
    io::stdout().write_all(&mut buf).unwrap();
}
```

This Rust WebAssembly function takes the subject on which it was triggered and an incoming payload and returns that payload prepended by the subject. This way it's easy to see what's happening when you trigger the function.

Build this function into a module using the following command:

```
$ cargo build --target wasm32-wasi --release
```

This will put `echofunction.wasm` in the `./target/wasm32-wasi/release` directory. This function takes up about **2MB** but can be shrunk down below **700KB** using public wasm tools. Your deployable WebAssembly functions use less disk space than even the smallest of memes.

## Host Services
Small, fast functions like this are perfect for doing things like transforming data or performing ad hoc calculations. As such, they lend themselves to being used as "_[pure functions](https://en.wikipedia.org/wiki/Pure_function)_". A pure function is just a function that has no side effects.

However, not everything people need to do with functions can be represented as a pure function with no I/O or side effects. This is where [host services](../host_services/) come in. In nearly every FaaS or Cloud Function runtime available in the cloud, you usually get access to some kind of SDK that grants your function some basic capabilities.

Lambda functions deployed in AWS have access to a subset of the AWS SDK, likewise with functions deployed in Azure and Google. Even so-called "edge functions" have access to tiny, optimized, edge versions of resources like key-value buckets, object stores, and more.

During the first experimental pre-release phase, we have a small number of services available for functions. At the moment, JavaScript functions have access to the following host services:

* Core Messaging, e.g. Pub, Sub, Request
* Key-Value Store
* Object Store
* HTTP Client

If the WASI component model for WebAssembly matures enough to the point where we think it will give our developers a worthy experience, then we can provide host services through the "WASI cloud" set of contracts. If the component model doesn't support a good enough developer experience within our timeframe, then we may end up providing our own contracts for host services. 

Stay tuned to our blog and social media outlets for news as we enhance and provide more host services.