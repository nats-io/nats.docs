# Clients

The official set of clients follows the [NATS Governance](https://github.com/nats-io/nats-general/blob/main/GOVERNANCE.md) model. These clients are managed under the [nats-io](https://github.com/nats-io) organization and are expected to maintain compatibility with current versions of the NATS server.

There are also many [community-developed clients](#community-clients) with varying degrees of maturity and compatibility. In most cases, all community-developed clients support basic NATS messaging functionality, while there are a smaller number supporting streaming, key-value, object store, and service APIs.

Forwards and backwards compatibility of the [client protocol](/reference/protocols/client) is a top priority so even if a client has not been updated for a while, it is likely to still work with recent versions of the server.

## Official Clients

### Go

```sh
go get github.com/nats-io/nats.go@v{% version name="go" /%}
```

#### Links

- [Tutorial]() (TODO)
- [Docs](https://pkg.go.dev/github.com/nats-io/nats.go)
- [Source](https://github.com/nats-io/nats.go)

### Rust

The Rust client has implementations, one that is synchonrous and one that is asynchronous using [Tokio]().

##### nats

```sh
cargo add nats@{% version name="rust" /%}
```

##### async-nats

```sh
cargo add async-nats@{% version name="rust-async" /%}
```

#### Links

- [Docs](https://docs.rs/nats)
- [Source](https://github.com/nats-io/nats.rs)
- [Package](https://crates.io/crates/nats)

### Java

##### Maven

```xml
<dependency>
    <groupId>io.nats</groupId>
    <artifactId>jnats</artifactId>
    <version>{% version name="java" /%}</version>
</dependency>
```

##### Gradle

```
implementation group: 'io.nats', name: 'jnats', version: '{% version name="java" /%}'
```

#### Links

- [Docs](https://javadoc.io/doc/io.nats/jnats)
- [Source](https://github.com/nats-io/nats.java)
- [Package](https://central.sonatype.com/artifact/io.nats/jnats/2.16.8)

### C#

```sh
dotnet add package NATS.Client --version {% version name=".net" /%}
```

#### Links

- [Docs](http://nats-io.github.io/nats.net/)
- [Source](https://github.com/nats-io/nats.net)
- [Package](https://www.nuget.org/packages/NATS.Client)

### Deno

```ts
import * as nats from "https://deno.land/x/nats@v{% version name="deno" /%}/src/mod.ts";
```

#### Links

- [Docs](https://nats-io.github.io/nats.deno/)
- [Source](https://github.com/nats-io/nats.deno)
- [Package](https://deno.land/x/nats)

### Node

```sh
npm install nats@{% version name="node" /%}
```

#### Links

- [Docs](https://nats-io.github.io/nats.deno/)
- [Source](https://github.com/nats-io/nats.js)
- [Package](https://www.npmjs.com/package/nats.js)

### Web

```sh
npm install nats.ws@{% version name="web" /%}
```

#### Links

- [Docs](https://nats-io.github.io/nats.deno/)
- [Source](https://github.com/nats-io/nats.ws)
- [Package](https://www.npmjs.com/package/nats.ws)

### Python

```sh
pip install nats-py=={% version name="python" /%}
```

#### Links

- [Docs](https://nats-io.github.io/nats.py/)
- [Source](https://github.com/nats-io/nats.py)
- [Package](https://pypi.org/project/nats-py/)

### Ruby

```sh
gem install nats-pure -v {% version name="rube-pure" /%}
```

#### Links

- [Docs](https://www.rubydoc.info/gems/nats-pure)
- [Source](https://github.com/nats-io/nats-pure.rb)
- [Package](https://rubygems.org/gems/nats-pure)

### C

##### Homebrew

```sh
brew install cnats@{% version name="c" /%}
```

##### vcpkg

To specify a version, [manifest mode](https://learn.microsoft.com/en-us/vcpkg/users/manifests) is required within a `vcpkg.json` file.

```json
{
  "dependencies": [ "cnats" ],
  "overrides": [
    { "name": "cnats", "version": "{% version name="c" /%}" }
  ]
}
```

Now run the command to install what is declared in the manifest.

```sh
vcpkg install
```

#### Links

- [Docs](http://nats-io.github.io/nats.c)
- [Source](https://github.com/nats-io/nats.c)

### Elixir

Currently, this client only supports NATS [messaging](/developers/messaging) capabilities.

##### mix.exs

```
{:gnat, "~> {% version name="elixir" /%}"}
```

##### rebar.config

```
{gnat, "{% version name="elixir" /%}"}
```

#### Links

- [Docs](https://hex.pm/packages/gnat)
- [Package](https://hex.pm/packages/gnat)
- [Source](https://github.com/nats-io/nats.ex)

## Community Clients

TODO
