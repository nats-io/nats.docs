# 中文文档专属反馈页面

这里是提供反馈、评论、建议、讨论等的地方。它不会出现在文档中，仅限审阅者/贡献者使用。

这就像一个便签本、留言板，甚至是一个聊天室，你可以直接编辑、添加评论、创建新章节，然后提交并推送你的更改到此文件（批准并合并你自己的PR即可，甚至你无需创建PR，可以直接提交并推送到仓库的主分支）。

## 聊天 - 通用

[JNM] 对于中文文档的反馈，请直接写在下面，并推送你的提交。你可以对文档进行任何修改、补充等操作，然后将其合并，并在此处说明你所做的内容。


## 翻译指南

### 术语表
your => 你

Core NATS => Core NATS ：保持不变，不要译作 核心 NATS
subject => 主题
reply-to => 回复到

scale up => 扩容
scale down => 缩容
sandbox => 沙盒

issue => issue
slow consumers => 慢速消费者
lazy listeners => 懒惰监听者
lame duck mode => 跛脚鸭模式
quality of service => QoS / 服务质量
JetStream publish calls => JetStream publish 调用
K/V store => 键值存储
object store => 对象存储
acknowledgment mechanism => ACK 机制
un-acknowledged => 依据上下文灵活译作 没有 ACK 等等
acknowledge => 依据上下文灵活译作 ACK/确认机制 等等
client application => 客户端应用

fire and forget => 即发即弃
Read Your Writes => 写后再读一致性
eventual consistency => 最终一致性
immediate consistency => 实时一致性

Leaf Node nats server => 被配置为叶子节点的 NATS 服务器
Leaf Node => 叶子节点

origin stream => 原始流
mirror stream => 镜像流
source streams => 设置了 Sources 的流 



#### Nex 领域特定术语
Preflight Check => 启动前检查
Host Services => 宿主服务        
维基百科：宿主（英语：Host），也称为寄主，是指为寄生物包括寄生虫、寄生植物、病毒等提供生存环境的生物。      
contracts => 接口规范 

#### nsc CLI 领域特定术语

operator => 运营商
Accounts -> 账户
Users -> 用户

## 已知问题

### 中文翻译文档里面的图片链接

中文翻译文档里面的图片链接目前没有变更，仍然是与英文版同样的相对链接，由于中文文档套了个 zh-cn 文件夹进去，导致这些指向 .gitbook/ 的相对链接全部失效。

需要在gitbook后台特别调整相对连接、或者修改这些与英文版同样的相对链接、或者在 zh-cn 创建一个指向父 `.gitbook/` 的符号链接（我不确定符号链接有没有兼容性问题）

### 关于 设置了 Sources 的流（英文原文 source streams）

我没找到好的译法，就把它译作 被配置了 source 的流 了。翻译AI对 origin stream、source streams 给出的翻译都是 “源流”，但他们两个指向的不是一个东西：origin stream 代表作为数据来源的原始流；而 source 在这里是 表达这个流被配置为源源不断地 "从（某地）获取" 数据，它是动词，“源流”的话根本没有表达出动词的含义，所以我没有通过AI的翻译，而现在这种直译虽然稍长，但能保证概念的准确传递，避免误解，大家可以提交更好的翻译！    