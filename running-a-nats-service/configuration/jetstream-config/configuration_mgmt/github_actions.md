# GitHub Actions

У нас есть набор GitHub Actions, которые позволяют управлять уже запущенным JetStream‑сервером. Это удобно для управления релизами или разворачивания тестовой инфраструктуры.

Полные детали и примеры — в репозитории [jetstream-gh-actions](https://github.com/nats-io/jetstream-gh-action). Ниже пример.

```yaml
on: push
name: orders
jobs:

  # Сначала удаляем stream и consumer ORDERS, если они уже существуют
  clean_orders:
    runs-on: ubuntu-latest
    steps:
      - name: orders_stream
        uses: nats-io/jetstream-gh-action/delete/stream@master
        with:
          missing_ok: 1
          stream: ORDERS
          server: js.example.net

  # Теперь создаем Stream и Consumers, используя те же конфигурационные файлы,
  # что и утилита nats CLI, как показано выше
  create_orders:
    runs-on: ubuntu-latest
    needs: clean_orders
    steps:
      - uses: actions/checkout@master
      - name: orders_stream
        uses: nats-io/jetstream-gh-action/create/stream@master
        with:
          config: ORDERS.json
          server: js.example.net
      - name: orders_new_consumer
        uses: nats-io/jetstream-gh-action/create/consumer@master
        with:
          config: ORDERS_NEW.json
          stream: ORDERS
          server: js.example.net

  # Публикуем сообщение в конкретный subject — возможно, какой‑то consumer
  # ждет его, чтобы запустить тесты
  publish_message:
    runs-on: ubuntu-latest
    needs: create_orders
    steps:
      - uses: actions/checkout@master
      - name: orders_new_consumer
        uses: nats-io/jetstream-gh-action@master
        with:
          subject: ORDERS.deployment
          message: Published new deployment via "${{ github.event_name }}" in "${{ github.repository }}"
          server: js.example.net
```
