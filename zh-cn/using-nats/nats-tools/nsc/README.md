# nsc

NATS 账户配置是使用 `nsc` 工具创建的。NSC 工具允许您：

* 创建和编辑操作员（Operators）、账户（Accounts）和用户（Users）
* 管理用户的发布（publish）和订阅（subscribe）权限
* 定义从账户导出的服务（Service）和流（Stream）
* 引用来自其他账户的服务和流
* 生成激活令牌（Activation tokens），以授予对私有服务或流的访问权限
* 生成用户凭据文件（User credential files）
* 描述操作员、账户、用户和激活信息
* 向一个账户 JWT 服务器推送和拉取账户 JWT

## 安装

安装 `nsc` 非常简单：

```shell
curl -L https://raw.githubusercontent.com/nats-io/nsc/master/install.py | python
```
> 在 [nsc 的 GitHub 仓库](https://github.com/nats-io/nsc#install) 中描述了更多安装 `nsc` 的方法。

该脚本将下载最新版本的 `nsc` 并将其安装到您的系统中。

如果尚未初始化 NSC，请运行 `nsc init`

执行 `tree -L 2 nsc/` 的输出如下：
```text
nsc/
├── accounts
│   ├── nats
│   └── nsc.json
└── nkeys
    ├── creds
    └── keys
5 directories, 1 file
```

**重要提示**：`nsc` 2.2.0 已发布。此版本的 `nsc` 仅支持 `nats-server` v2.2.0 和 `nats-account-server` v1.0.0。更多信息请参阅 [nsc 2.2.0 发布说明](https://github.com/nats-io/nsc/releases/tag/2.2.0)。

## 教程

您可以在这里找到各种面向任务的工具实战教程：

* [基本用法](basics.md)
* [配置账户流的导入/导出](streams.md)
* [配置账户服务的导入/导出](services.md)
* [签名密钥](signing_keys.md)
* [撤销用户或激活](revocation.md)
* [使用托管操作员](managed.md)

## 工具文档

如需更具体的使用方法，请查看 `nsc` 工具文档。您可以在工具本身中找到它：

```shell
nsc help
```

或 [此处](https://nats-io.github.io/nsc) 的在线版本。