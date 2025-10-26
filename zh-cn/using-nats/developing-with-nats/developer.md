# 使用 NATS 客户端 API 进行开发

使用 NATS 进行开发涉及分布式应用程序技术、NATS 常用功能以及特定库的语法。除了本指南之外，大多数库还提供自动生成的 API 文档，以及针对特定语言和平台的示例、指南和其他资源。

| 语言 | 链接                                                                                                               |是否受 Synadia（官方）支持 |
| :--- |:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| :------|
| Golang | [nats.go](https://github.com/nats-io/nats.go), [godoc](http://godoc.org/github.com/nats-io/nats.go)                                                       | 是                     |
| Java | [nats.java](https://github.com/nats-io/nats.java), [javadoc](https://javadoc.io/doc/io.nats/jnats), [nats.java 示例](https://github.com/nats-io/nats.java/tree/main/src/examples/java/io/nats/examples), [java-nats-examples 仓库](https://github.com/nats-io/java-nats-examples) | 是   | 
| .NET | [nats.net](https://github.com/nats-io/nats.net), [文档](http://nats-io.github.io/nats.net/), [程序包](https://www.nuget.org/packages/NATS.Net)       | 是              |
| Rust | [nats.rs](https://github.com/nats-io/nats.rs), [Rust 文档](https://docs.rs/async-nats/latest/async_nats/)               | 是                                                                                   |
| JavaScript | [nats.js](https://github.com/nats-io/nats.js), [jsdoc](https://nats-io.github.io/nats.js/) | 是  |
| Python | [nats.py](https://github.com/nats-io/nats.py), [文档](https://nats-io.github.io/nats.py/)                       | 是                                                                  |
| C | [nats.c](https://github.com/nats-io/nats.c), [文档](http://nats-io.github.io/nats.c)                      | 是                                                                        |
| Ruby | [nats-pure.rb](https://github.com/nats-io/nats-pure.rb), [yard](https://www.rubydoc.info/gems/nats)                                                                            |
| Elixir | [nats.ex](https://github.com/nats-io/nats.ex), [hex 文档](https://hex.pm/packages/gnat)                                                                                         |
| Zig | [nats.zig](https://github.com/nats-io/nats.zig)                                                                                                                                |
| Swift | [nats.swift](https://github.com/nats-io/nats.swift) |

并非所有库都有自己的文档，这取决于对应的社区，但请务必查看客户端库的 README 文件以获取更多信息。

还有许多其他由社区贡献并维护的 NATS 客户端库和示例，可在 GitHub 上找到，例如：

* [Kotlin](https://github.com/nats-io/kotlin-nats-examples)
* [Dart](https://github.com/dgofman/nats_client), [Dart](https://github.com/chartchuo/dart-nats) 和 [Dart](https://github.com/c16a/nats-dart)
* [Tcl](https://github.com/Kazmirchuk/nats-tcl)
* [Crystal](https://github.com/jgaskins/nats)
* [PHP](https://github.com/basis-company/nats.php) 和 [PHP](https://github.com/repejota/phpnats)
* [Pascal](https://github.com/biot2/nats.pas/blob/main/nats.core.pas)
* 以及更多 [库](https://github.com/search?o=desc&p=1&q=nats+client&s=updated&type=Repositories)...