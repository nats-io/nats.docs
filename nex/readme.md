# Running Workloads on NATS
The NATS Execution Engine (we'll just call it **Nex** most of the time) is an optional add-on to NATS that overlays your existing NATS infrastructure, giving you the ability to deploy and run workloads. 

Building applications that rely on NATS as a backbone already gives us a tremendous amount of power and features out of the box, including message communications, global reach, reliability, and additional services such as streams, key-value stores, and object stores. However, prior to the availability of **Nex**, we haven't been able to use that infrastructure as a _deployment target_.

{% hint style="warning" %}
The NATS execution engine is currently **experimental**. The documentation, feature set, and any APIs are likely to change frequently.
{% endhint %}

While you can build virtually any kind of application with Nex, the core building blocks are made up of two fundamental types of workloads: **services** and **functions**.

## Services
Within the context of **Nex**, a _service_ is just a long-running process. When it is deployed, it is launched with a given environment and runs continually until terminated. Typical examples of service-type workloads are web servers, monoliths, API endpoints, and applications that maintain long-running subscriptions to NATS subjects.

The default, secure Nex services are statically-linked, 64-bit linux (elf) binaries but you can also run native Mac or Windows binaries as services and you can customize the root file system used for the Firecracker sandbox. Support for [OCI](https://opencontainers.org/) (e.g. docker) images is coming soon.

## Functions
Nex _functions_ are short-lived processes. They are executed in response to some trigger where the functions can process the trigger's data and optionally supply a return value. Nex functions are small and can be deployed either as JavaScript functions or as WebAssembly modules.