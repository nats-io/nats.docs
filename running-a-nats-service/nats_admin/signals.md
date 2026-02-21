# Сигналы

## Командная строка

На Unix‑системах сервер NATS реагирует на следующие сигналы.  
Их можно отправлять стандартной Unix‑командой `kill`, либо для удобства использовать `nats-server --signal`.

| команда nats-server | Unix‑сигнал | Описание                                                    |
| :------------------ | :---------- | :---------------------------------------------------------- |
| `--signal ldm`      | `SIGUSR2`   | Корректное завершение (постепенно «вытесняет» клиентов) ([lame duck mode](lame_duck_mode.md)) |
| `--signal quit`     | `SIGINT`    | Корректно останавливает сервер                              |
| `--signal term`     | `SIGTERM`   | Корректно останавливает сервер                              |
| `--signal stop`     | `SIGKILL`   | Немедленно завершает процесс                                |
| `--signal reload`   | `SIGHUP`    | Перезагружает конфигурационный файл сервера                 |
| `--signal reopen`   | `SIGUSR1`   | Переоткрывает файл логов для ротации                         |
| _(только kill)_     | `SIGQUIT`   | Немедленно завершает процесс и делает [stack dump](https://pkg.go.dev/os/signal#hdr-Default_behavior_of_signals_in_Go_programs)         |

### Использование

Чтобы отправить сигнал запущенному `nats-server`:

```shell
nats-server --signal <command>
```

Например, чтобы корректно остановить сервер через lame duck mode:

```shell
nats-server --signal ldm
```

### Несколько процессов

Если запущено несколько процессов `nats-server` или недоступен `pgrep`, нужно либо указать PID, либо абсолютный путь к PID‑файлу:

```shell
nats-server --signal stop=<pid>
```

```shell
nats-server --signal stop=/path/to/pidfile
```

Начиная с NATS v2.10.0, можно использовать glob‑выражение для сопоставления одного или нескольких PID, например:

```shell
nats-server --signal ldm=12*
```

## В Windows

См. раздел [Windows Service](../running/windows_srv.md) о сигнализации `nats-server` в Windows.
