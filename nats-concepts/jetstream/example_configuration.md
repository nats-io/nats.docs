# Пример

Рассмотрим такую архитектуру:

![Orders](<../../.gitbook/assets/streams-and-consumers-75p (1).png>)

Хотя это неполная архитектура, она демонстрирует несколько ключевых моментов:

* Многие связанные subjects хранятся в одном Stream
* Consumers могут работать в разных режимах и получать только подмножества сообщений
* Поддерживаются разные режимы подтверждений

Новый заказ приходит на `ORDERS.received` и отправляется consumer‑у `NEW`, который в случае успеха создаст новое сообщение на `ORDERS.processed`. Сообщение `ORDERS.processed` снова попадет в Stream, где consumer `DISPATCH` получит его и после обработки создаст сообщение `ORDERS.completed`, которое снова попадет в Stream. Все эти операции выполняются в режиме `pull`, то есть это рабочие очереди, которые можно масштабировать горизонтально. Все они требуют подтвержденной доставки, чтобы ни один заказ не был пропущен.

Все сообщения доставляются consumer‑у `MONITOR` без подтверждений и с семантикой Pub/Sub — они пушатся в монитор.

По мере подтверждения сообщений consumer‑ами `NEW` и `DISPATCH`, часть из них семплируется, и сообщения, указывающие количество повторных доставок, задержки подтверждений и другое, отправляются в систему мониторинга.

## Пример конфигурации

[Дополнительная документация](/running-a-nats-service/configuration/clustering/jetstream_clustering/administration.md) описывает утилиту `nats` и то, как использовать ее для создания, мониторинга и управления потоками и consumers, но для полноты и справки вот как создать сценарий ORDERS. Мы настроим хранение сообщений, связанных с заказами, на 1 год:

```bash
nats stream add ORDERS --subjects "ORDERS.*" --ack --max-msgs=-1 --max-bytes=-1 --max-age=1y --storage file --retention limits --max-msg-size=-1 --discard=old
nats consumer add ORDERS NEW --filter ORDERS.received --ack explicit --pull --deliver all --max-deliver=-1 --sample 100
nats consumer add ORDERS DISPATCH --filter ORDERS.processed --ack explicit --pull --deliver all --max-deliver=-1 --sample 100
nats consumer add ORDERS MONITOR --filter '' --ack none --target monitor.ORDERS --deliver last --replay instant
```
