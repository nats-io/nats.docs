# NATS service infrastructure

The overall architecture of NATS is that you have 'NATS client applications' that are developed using one of the NATS client libraries. Those applications in order to run need access to a supporting NATS service infrastructure of one or more nats servers, the only configuration needed by the client applications being the location (NATS URLs) of some nats servers and if required their security credentials.

Note that if your application is written in Golang then you even have the option of embedding the nats server functionality into the application itself (however you need to then configure your application instances with nats-server configuration information).

## NGS

You do not actually need to run your NATS service infrastructure, instead you can instead make use of a public NATS infrastructure offered by an Internet Nats Service Provider such as Synadia's [NGS](https://synadia.com/ngs/pricing). NGS is an always-on, secure, globally distributed super-cluster of nats-server clusters located in all the major cloud providers and regions with automated redirection of the client application connections to the nearest NGS cluster.

You can start using NGS simply by getting a free account and easily scale according to your applications' needs by adjusting your plan and then either have your applications connect directly to the NGS clusters or deploy your own 'leaf node' nats servers wherever you want or need them. 

## Running your own NATS service infrastructure

You can of course always deploy and run your own NATS service infrastructure of nats-server instances.

From just running a single local nats-server for development purposes to running a global super-cluster with dozens of clusters, leaf nodes and hundreds or thousands of nats servers and from the clouds to on premises all the way out to the edge and partially connected devices (and any hybrid thereof), NATS supports a huge amount of flexibility in how you can scale and deploy your NATS service infrastructure. 