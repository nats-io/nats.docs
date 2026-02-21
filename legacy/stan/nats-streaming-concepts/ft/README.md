# Отказоустойчивость

Чтобы уменьшить риск единой точки отказа, NATS Streaming Server можно запускать в режиме Fault Tolerance. Он работает как группа серверов: один выступает активным сервером \(получает доступ к хранилищу\) и обрабатывает всё взаимодействие с клиентами, остальные работают как резервные.

Важно: NATS Streaming нельзя одновременно запускать и в режиме Fault Tolerance, и в режиме Clustering.

Чтобы запустить сервер в режиме Fault Tolerance \(FT\), нужно указать имя FT-группы.

Ниже пример запуска 2 серверов в режиме FT на одном хосте со встроенными NATS-серверами:

Сервер 1
```shell
nats-streaming-server -store file -dir datastore -ft_group "ft" -cluster nats://localhost:6222 -routes nats://localhost:6223 -p 4222
```

Сервер 2
```shell
nats-streaming-server -store file -dir datastore -ft_group "ft" -cluster nats://localhost:6223 -routes nats://localhost:6222 -p 4223
```

