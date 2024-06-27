# Nex FAQ
Frequently Asked Questions about the NATS Execution Engine

### General

* [What is Nex?](faq.md#what-is-nex)
* [Where can I find Nex?](faq.md#where-can-i-find-nex)
* [Who maintains Nex?](faq.md#who-maintains-nex)
* [Is Nex free?](faq.md#is-nex-free)

### Running Workloads

* [What workload types can I run?](faq.md#what-workload-types-can-i-run)
* [What is a root file system?](faq.md#what-is-a-root-file-system)

### Technical Details

* [What are namespaces?](faq.md#what-are-namespaces)
* [Are my workload configurations secure?](faq.md#are-my-workload-configurations-secure)
* [What is the difference between run and devrun?](faq.md#what-is-the-difference-between-run-and-devrun)
* [How does Nex compare to Kubernetes?](faq.md#how-does-nex-compare-to-kubernetes)
* [Do I run Nex inside Firecracker?](faq.md#do-i-run-nex-inside-firecracker)

## General

### What is Nex?
Nex is an open source, lightweight execution engine that runs alongside NATS. Nex *nodes* are run to form a universal pool in which you can deploy services and functions in JavaScript, WebAssembly, and even regular operating system executable binaries.

### Where Can I Find Nex?
The code for Nex can be found in the appropriate [Synadia](https://github.com/synadia-io/nex) repository. It is an open source project that is supported by Synadia, the creators of NATS.

### Who Maintains Nex?
The primary maintainers of the Nex code are employees of Synadia, though more maintainers are always welcome.

### Is Nex Free?
Yes, all of the code in the Nex repository is free and licensed under the **Apache-2.0** license.

## Running Workloads

### What workload types can I run?
Nex supports two categories of workloads: **services** and **functions**. Services are long-lived while functions are short-lived and triggered on demand by some stimulus.

Services can be native, compiled binaries (64-bit **elf** when running with Firecracker enabled) and functions can be either a **WebAssembly** module or a **JavaScript** exported function. OCI image support is coming soon.

### What is a root file system?
By default, Nex uses [Firecracker](https://firecracker-microvm.github.io/) to launch small, secure, fast, and light weight virtual machines. These machines each run an agent that manages the workload in that machine as well as communications with the Nex node.

The root file system is essentially a snapshot of the operating system disk image that will be used when bringing up the virtual machine. It's like a Docker layer, but much more efficient.

## Technical Details

### What are namespaces?
A namespace is a unit of multi-tenancy. All workloads are scoped to a namespace. If you deploy the `echoservice` workload within the `default` namespace and also deploy it within the `sample` namespace, they will not be treated the same by Nex. Namespaces are _logical_ groupings and Nex doesn't enforce a hard network boundary between them or enforce opinions about how you use namespaces.

### Are my workload configurations secure?
Absolutely! Every request to run a workload is sent to a specific Nex node. This Nex node has a public **Xkey** that is used to encrypt data, such as environment variables and other sensitive data, sent to that node. _Only_ that node can decrypt data meant for it.

Further, only the entity that started a workload can terminate that workload.

### What is the difference between run and devrun?
In short, `nex run` is meant for production and real deployments while `nex devrun` is meant for developer iteration loops and testing environments. A regular request to run a workload must contain all of the following:

* An issuer **nkey** that counts as the entity certifying the request
* A publisher **xkey** that is used as the source of encrypted data
* A URL indicating the location of the workload that is stored in an object store, in the form of `nats://{BUCKET}/{key}`.
* A set of environment variables to be passed to the workload when it is run
* A fixed and properly formatted workload _name_
* A namespace (logical grouping) in which the workload is to be run.

Manually supplying all this information when you're just trying to develop and test on your local machine is cumbersome, so using `devrun` all you need do is supply a path to the workload binary file (`.wasm`, `.js`, ELF binary) and the environment variables, and the `nex` CLI will take care of managing the rest for you, including uploading your file to an object store automatically.

### How does Nex Compare to Kubernetes?
Kubernetes is a distributed workload execution engine, as is Nex. This is where their paths diverge. Nex is able to provide an efficient, tailored user experience because it is opinionated and optimized for running NATS-based workloads, where Kubernetes is designed to be so generalized that it can do practically anything given enough time or money. This broad set of uses can make Kubernetes difficult to manage, deploy, and configure.

While most users interact with a _declarative_ layer in Kubernetes that is managed an enormous amount of YAML, Nex is a purely _imperative_ system easily managed via CLI and a simple API.

### Do I run Nex inside Firecracker?
In a word, _no_. The Nex node process is responsible for spawning Firecracker VMs that contain the Nex agent. As a supervisor of Firecracker processes, the Nex node itself can't be run inside a Firecracker VM. Most of that complexity should be hidden from end users.