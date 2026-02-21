# Подключения NATS

NATS поддерживает несколько видов подключений _напрямую_ к серверам NATS.

* Обычные NATS‑подключения
* NATS‑подключения с TLS‑шифрованием
* [WebSocket](https://github.com/nats-io/nats.ws) NATS‑подключения
* Подключения клиентов [MQTT](/running-a-nats-service/configuration/mqtt/)

Также доступен ряд адаптеров для мостов трафика в другие системы обмена сообщениями и обратно.

* [Kafka Bridge](https://github.com/nats-io/nats-kafka)
* [JMS](https://github.com/nats-io/nats-jms-bridge), который также можно использовать для интеграции с MQ и RabbitMQ, так как оба предоставляют интерфейс JMS
