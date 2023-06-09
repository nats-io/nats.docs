---
title: Clients
description: Client download/install guide.
---

# {% $markdoc.frontmatter.title %}

The official set of clients follows the [NATS Governance](https://github.com/nats-io/nats-general/blob/main/GOVERNANCE.md) model. These clients are managed under the [nats-io](https://github.com/nats-io) organization and are expected to maintain compatibility with current versions of the NATS server.

There are also many [community-developed clients](#community-clients) with varying degrees of maturity and compatibility. In most cases, all community-developed clients support basic NATS messaging functionality, while there are a smaller number supporting streaming, key-value, object store, and service APIs.

Forwards and backwards compatibility of the [client protocol](/reference/protocols/client) is a top priority so even if a client has not been updated for a while, it is likely to still work with recent versions of the server.

## Official Clients

### CLI

The NATS CLI is an essential tool for trying out the core capabilities of NATS without writing any code, but also provides a slew of introspection, management, and benchmarking tools.

#### Builds

Standalone builds for all supported operating systems and CPU architectures are available as downloadable assets on the [GitHub releases page](https://github.com/nats-io/natscli/releases/). For convenience, here is a matrix of with direct links:

|       | Linux                                          | macOS                                      | Windows                                    | FreeBSD                                            |
| :---- | :--------------------------------------------- | :----------------------------------------- | :----------------------------------------- | :------------------------------------------------- |
| amd64 | [zip][linux-amd64-zip], [tgz][linux-amd64-tgz] | [zip][mac-amd64-zip], [tgz][mac-amd64-tgz] | [zip][win-amd64-zip], [tgz][win-amd64-tgz] | [zip][freebsd-amd64-zip], [tgz][freebsd-amd64-tgz] |
| arm64 | [zip][linux-arm64-zip], [tgz][linux-arm64-tgz] | [zip][mac-arm64-zip], [tgz][mac-arm64-tgz] | [zip][win-arm64-zip], [tgz][win-arm64-tgz] | -                                                  |
| arm6  | [zip][linux-arm6-zip], [tgz][linux-arm6-tgz]   | -                                          | [zip][win-arm6-zip], [tgz][win-arm6-tgz]   | -                                                  |
| arm7  | [zip][linux-arm7-zip], [tgz][linux-arm7-tgz]   | -                                          | [zip][win-arm7-zip], [tgz][win-arm7-tgz]   | -                                                  |
| 386   | [zip][linux-386-zip], [tgz][linux-386-tgz]     | -                                          | [zip][win-386-zip], [tgz][win-386-tgz]     | -                                                  |

[linux-amd64-tgz]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-linux-amd64.tar.gz
[linux-amd64-zip]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-linux-amd64.zip
[linux-386-tgz]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-linux-386.tar.gz
[linux-386-zip]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-linux-386.zip
[linux-arm6-tgz]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-linux-arm6.tar.gz
[linux-arm6-zip]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-linux-arm6.zip
[linux-arm7-tgz]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-linux-arm7.tar.gz
[linux-arm7-zip]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-linux-arm7.zip
[linux-arm64-tgz]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-linux-arm64.tar.gz
[linux-arm64-zip]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-linux-arm64.zip
[mac-amd64-tgz]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-darwin-amd64.tar.gz
[mac-amd64-zip]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-darwin-amd64.zip
[mac-arm64-tgz]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-darwin-arm64.tar.gz
[mac-arm64-zip]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-darwin-arm64.zip
[win-amd64-tgz]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-windows-amd64.tar.gz
[win-amd64-zip]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-windows-amd64.zip
[win-386-tgz]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-windows-386.tar.gz
[win-386-zip]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-windows-386.zip
[win-arm6-tgz]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-windows-arm6.tar.gz
[win-arm6-zip]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-windows-arm6.zip
[win-arm7-tgz]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-windows-arm7.tar.gz
[win-arm7-zip]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-windows-arm7.zip
[win-arm64-tgz]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-windows-arm64.tar.gz
[win-arm64-zip]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-windows-arm64.zip
[freebsd-amd64-tgz]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-freebsd-amd64.tar.gz
[freebsd-amd64-zip]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-freebsd-amd64.zip

#### Packages

Official builds are packaged for Debian and Red Hat-based distributions.

|       | Debian           | RedHat           |
| :---- | :--------------- | :--------------- |
| amd64 | [deb][deb-amd64] | [rpm][rpm-amd64] |
| arm64 | [deb][deb-arm64] | [rpm][rpm-arm64] |
| arm6  | [deb][deb-arm6]  | [rpm][rpm-arm6]  |
| arm7  | [deb][deb-arm7]  | [rpm][rpm-arm7]  |
| 386   | [deb][deb-386]   | [rpm][rpm-386]   |

[deb-amd64]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-amd64.deb
[deb-arm64]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-arm64.deb
[deb-arm6]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-arm6.deb
[deb-arm7]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-arm7.deb
[deb-386]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-386.deb
[rpm-amd64]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-amd64.rpm
[rpm-arm64]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-arm64.rpm
[rpm-arm6]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-arm6.rpm
[rpm-arm7]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-arm7.rpm
[rpm-386]: https://github.com/nats-io/natscli/releases/download/v0.0.35/nats-0.0.35-386.rpm

##### Debian/Ubuntu

Install it using `apt install` with the appropriate permissions (i.e. `sudo`).

```sh
apt install ./nats-<version>-<arch>.deb
```

##### CentOS/RedHat

Install it using `rpm` with the appropriate permissions (i.e. `sudo`).

```sh
rpm -i ./nats-<version>-<arch>.rpm
```

#### macOS

##### Homebrew

Homebrew is updated via community contribution, but the Formulae is often updated the same day that a new release is made.

```sh
brew tap nats-io/nats-tools
brew install nats-io/nats-tools/nats
```

### Go

```sh
go get github.com/nats-io/nats.go@v{% version name="go" /%}
```

#### Links

- [Docs](https://pkg.go.dev/github.com/nats-io/nats.go)
- [Source](https://github.com/nats-io/nats.go)
- [Package](https://github.com/nats-io/nats.go)

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
