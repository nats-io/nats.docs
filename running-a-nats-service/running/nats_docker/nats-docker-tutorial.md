# Учебник

В этом учебнике вы запускаете [Docker‑образ сервера NATS](https://hub.docker.com/_/nats/). Docker‑образ предоставляет экземпляр сервера NATS. Synadia активно поддерживает образ nats-server. Размер образа NATS — всего 6 МБ.

**1. Настройте Docker.**

См. [Get Started with Docker](http://docs.docker.com/mac/started/) для руководства.

Самый простой способ запустить Docker — использовать [Docker Toolbox](http://docs.docker.com/mac/step_one/).

**2. Запустите Docker‑образ nats-server.**

```bash
docker run -p 4222:4222 -p 8222:8222 -p 6222:6222 --name nats-server -ti nats:latest
```

**3. Убедитесь, что сервер NATS запущен.**

Вы должны увидеть следующее:

```text
Unable to find image 'nats:latest' locally
latest: Pulling from library/nats
2d3d00b0941f: Pull complete 
24bc6bd33ea7: Pull complete 
Digest: sha256:47b825feb34e545317c4ad122bd1a752a3172bbbc72104fc7fb5e57cf90f79e4
Status: Downloaded newer image for nats:latest
```

После этого — вывод, что сервер NATS запущен:

```text
[1] 2019/06/01 18:34:19.605144 [INF] Starting nats-server version 2.0.0
[1] 2019/06/01 18:34:19.605191 [INF] Starting http monitor on 0.0.0.0:8222
[1] 2019/06/01 18:34:19.605286 [INF] Listening for client connections on 0.0.0.0:4222
[1] 2019/06/01 18:34:19.605312 [INF] Server is ready
[1] 2019/06/01 18:34:19.608756 [INF] Listening for route connections on 0.0.0.0:6222
```

Обратите внимание, как быстро скачивается Docker‑образ сервера NATS. Его размер всего 6 МБ.

**4. Проверьте сервер NATS, чтобы убедиться, что он запущен.**

Простой способ проверить порт клиентских подключений — использовать telnet.

```bash
telnet localhost 4222
```

Ожидаемый результат:

```text
Trying ::1...
Connected to localhost.
Escape character is '^]'.
INFO {"server_id":"NDP7NP2P2KADDDUUBUDG6VSSWKCW4IC5BQHAYVMLVAJEGZITE5XP7O5J","version":"2.0.0","proto":1,"go":"go1.11.10","host":"0.0.0.0","port":4222,"max_payload":1048576,"client_id":13249}
```

Также можно проверить endpoint мониторинга, открыв `http://localhost:8222` в браузере.
