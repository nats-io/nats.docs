# Disaster Recovery

Wikipedia defines disaster recovery (DR) as (emphasis added):

> a set of policies, tools, and procedures to enable the **recovery** or **continuation** of vital technology infrastructure and systems following a **natural** or **human-induced disaster**.

> disaster recovery assumes that the **primary site** is not recoverable for some time and represents a process of **restoring data** and **services** to a secondary survived site, which is opposite to restoring it back to its original place.

No matter the root cause, a disaster can manifest as two general classes of issue: service degradation and data loss.

Service degradation includes behaviors such as increased latency, decreased throughput, and partial (or no) availability.

Data loss includes packet loss on a network, partial or full loss of one or more replicas (copies of data), as well as data corruption in storage.

Responsibility ultimately falls onto the organization providing a service or data, however the appropriate choice of technology and use of infrastructure providers can [significantly reduce the impact][cloud-dr] when disasters occur.

[cloud-dr]: https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-is-different-in-the-cloud.html

NATS is one such technology that can enable a system to be inherently more resilient. This document will discuss the architectures and feature set of NATS that can make systems more _resilient_ to the effects of a disaster.

## Service degradation

A common *starter* NATS deployment is a three node cluster where each node is in a different availability zone (AZ) within a single region. A cluster forms a *full connective mesh*. This simply means that every node is aware of every other node and gossips information such as subject interest, round-trip latencies, and health checks.

*TODO: diagram illustrating this*

When a client connects it can provide one or more server URLS, for example:

```go
nats.Connect("nats://a.us-east-4.cluster:4222")
// or...
nats.Connect("nats://a.us-east-4.nats:4222,nats://b.us-east-4.nats:4222,nats://c.us-east-4.nats:4222")
```

Upon connection, one of the URLs will be randomly selected and used to establish the connection. If for some reason one of the nodes is unavailable, it will automatically try another one, if specified. Once connected, the server will share with the client all known servers in the cluster. This is useful if the client gets disconnected and then automatically tries to reconnect. Since it has these additional server URLs, it can attempt to reconnect to any of them if the original one is unavailable.

> **Tip 1:** Always specify more than one connection URL so clients can automatically connect to another server if needed. Re-connections can use the *discovered* servers after the initial connection, but not initially.

*TODO: any info on how NGS transparently chooses a server.. just DNS lookups?*

What is this *starter* cluster resilient to? If any of the nodes become unavailable, clients will transparently reconnect to the another

The effect of a disaster may be observed in terms of infrastructure issues or data corruption.

An infrastructure issue is one where the compute, storage, or network that the software utilizes becomes unavailable or fails. This is the more common kind of effect with varying degrees of likelihood and severity.

A corruption issue is one where the data becomes _corrupt_ from the application's standpoint. In this context, this could be due to a bug in the NATS server or clients, the application itself, or [cosmic rays flipping bits][cosmic]. This kind of disaster is more subtle, but can often wreak more havoc or cause confusion if checksums start failing.

[cosmic]: https://stackoverflow.com/questions/2580933/cosmic-rays-what-is-the-probability-they-will-affect-a-program

---
However, it boils down to trading off performance and cost (money). There is no one-size-fits-all solution for DR since every application may have different tolerances.

Is data loss acceptable? What if its only a couple seconds worth of messages? Is being unavailable acceptable? What about latency? How many users will you disappoint or money will you lose if your application can't respond successfully within a adequate period of time?

Everyone wants (the unattainable) 100% availability and fault tolerance.

---


## Infrastructure


