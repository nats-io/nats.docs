# 通过 CLI 进行管理和使用

启动服务器后，就可以开始使用管理工具了。  
请参考 [README 文件中的安装部分](https://github.com/nats-io/natscli?tab=readme-ov-file#installation)。

```
nats --help
nats cheat
```

我们将逐步演示上述场景，并在重新创建上述设置的过程中介绍 CLI 和 JetStream 的功能。

在本示例中，我们还会展示其他命令，例如 `nats pub` 和 `nats sub`，以与系统进行交互。这些是现有的标准 Core NATS 命令，仅使用 Core NATS 就可完全操作 JetStream。

我们还会涉及一些额外的功能，但请务必查看有关设计模型的部分，以便了解所有可能的组合方式。