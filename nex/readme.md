# Running Workloads on NATS
The NATS Execution Engine (we'll just call it Nex most of the time) is an add-on to NATS that overlays your existing NATS infrastructure, giving you the ability to deploy and run workloads. 

When we build applications that rely on NATS as a backbone, we get to leverage communications, global reach, reliability, performance, and even services like JetStream, Key-Value stores, and Object Stores. However, up until Nex, we haven't been able to use that infrastructure as a _deployment target_.

{% hint style="warning" %}
The NATS execution engine is currently **experimental**. The documentation, feature set, and any APIs are likely to change frequently.
{% endhint %}

While you can build virtually any kind of application with Nex, the core building blocks are made up of two fundamental types of workloads: **services** and **functions**.

## Services
Within the context of **Nex**, a _service_ is just a long-running process. When it is deployed, it is launched with a given environment and runs continually until terminated. Typical examples of service-type workloads are web servers, monoliths, API endpoints, and applications that maintain long-running subscriptions to NATS subjects.

Nex services are statically-linked, 64-bit linux (elf) binaries. However, you can also create your own root file system with a container daemon installed and run OCI images as well.

## Functions
Nex _functions_ are short-lived processes. They are executed in response to some trigger where the functions can process the trigger's data and optionally supply a return value. Nex functions are small and can be deployed either as JavaScript functions or as WebAssembly modules.