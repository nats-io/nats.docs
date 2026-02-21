# Как разрабатывать с помощью клиентского API NATS

Разработка с NATS сочетает техники распределённых приложений, общие возможности NATS и специфичный для библиотеки синтаксис. Помимо этого руководства, большинство библиотек предоставляет автогенерируемую документацию API, а также примеры, руководства и другие ресурсы, зависящие от языка и платформы.

| Язык | Ссылки                                                                                                               | Поддерживается Synadia                                                           |
| :--- |:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| :------|
| Golang | [nats.go](https://github.com/nats-io/nats.go), [godoc](http://godoc.org/github.com/nats-io/nats.go)                                                       |  Да                     |
| Java | [nats.java](https://github.com/nats-io/nats.java), [javadoc](https://javadoc.io/doc/io.nats/jnats), [примеры nats.java](https://github.com/nats-io/nats.java/tree/main/src/examples/java/io/nats/examples), [репозиторий java-nats-examples](https://github.com/nats-io/java-nats-examples) |  Да   | 
| .NET | [nats.net](https://github.com/nats-io/nats.net), [документация](http://nats-io.github.io/nats.net/), [пакет](https://www.nuget.org/packages/NATS.Net)       |  Да              |
| Rust | [nats.rs](https://github.com/nats-io/nats.rs), [документация rust](https://docs.rs/async-nats/latest/async_nats/)               |  Да                                                                                   |
| JavaScript | [nats.js](https://github.com/nats-io/nats.js), [jsdoc](https://nats-io.github.io/nats.js/) |  Да  |
| Python | [nats.py](https://github.com/nats-io/nats.py), [документация](https://nats-io.github.io/nats.py/)                       |  Да                                                                  |
| C | [nats.c](https://github.com/nats-io/nats.c), [документация](http://nats-io.github.io/nats.c)                      |  Да                                                                        |
| Ruby | [nats-pure.rb](https://github.com/nats-io/nats-pure.rb), [yard](https://www.rubydoc.info/gems/nats)                                                                            |
| Elixir | [nats.ex](https://github.com/nats-io/nats.ex), [hex doc](https://hex.pm/packages/gnat)                                                                                         |
| Zig | [nats.zig](https://github.com/nats-io/nats.zig)                                                                                                                                |
| Swift | [nats.swift](https://github.com/nats-io/nats.swift) |

Не все библиотеки имеют собственную документацию, это зависит от сообщества конкретного языка, но обязательно посмотрите README клиентских библиотек для дополнительной информации.

Существуют и другие клиентские библиотеки NATS и примеры, поддерживаемые сообществом и доступные на GitHub, например:

* [Kotlin](https://github.com/nats-io/kotlin-nats-examples)
* [Dart](https://github.com/dgofman/nats_client), [Dart](https://github.com/chartchuo/dart-nats) и [Dart](https://github.com/c16a/nats-dart)
* [Tcl](https://github.com/Kazmirchuk/nats-tcl)
* [Crystal](https://github.com/jgaskins/nats)
* [PHP](https://github.com/basis-company/nats.php) и [PHP](https://github.com/repejota/phpnats)
* [Pascal](https://github.com/biot2/nats.pas/blob/main/nats.core.pas)
* и многие [другие](https://github.com/search?o=desc&p=1&q=nats+client&s=updated&type=Repositories)...
