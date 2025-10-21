# GitHub Actions

我们有一组 GitHub Actions，让你可以管理已经运行的 JetStream 服务器，这对于管理发布或建立测试基础设施非常有用。

完整详细信息和示例在 [jetstream-gh-actions](https://github.com/nats-io/jetstream-gh-action) 仓库中，这里是一个示例。

```yaml
on: push
name: orders
jobs:

  # 首先我们删除 ORDERS 流和消费者（如果它们已经存在）
  clean_orders:
    runs-on: ubuntu-latest
    steps:
      - name: orders_stream
        uses: nats-io/jetstream-gh-action/delete/stream@master
        with:
          missing_ok: 1
          stream: ORDERS
          server: js.example.net

  # 现在我们使用与上面显示的 nats CLI 实用程序相同的配置文件创建流和消费者
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

  # 我们将消息发布到特定主题，也许某个消费者正在那里等待它来启动测试
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