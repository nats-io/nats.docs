# NATS Service Infrastructure

NATS is a client/server system in the fact that you have 'NATS client applications' (applications using one of the NATS client libraries) that connect to 'NATS servers' that provide the NATS service. The NATS servers work together to provide a NATS service infrastructure to their client applications.

NATS is extremely flexible and scalable and allows the service infrastructure to be as small as a single process running locally on your local machine and as large as an 'Internet of NATS' of Leaf Nodes, and Leaf Node clusters all interconnected in a secure way over a global shared NATS super-cluster.  

Regardless of the size and complexity of the NATS service infrastructure being used, the only configuration needed by the client applications being the location (NATS URLs) of one or more NATS servers and depending on the required security, their credentials.

Note that if your application is written in Golang then you even have the option of embedding the NATS server functionality into the application itself (however you need to then configure your application instances with nats-server configuration information).

You do not actually need to run your NATS service infrastructure, instead you can instead make use of a public NATS infrastructure offered by a NATS Service Provider such as Synadia's [NGS](https://synadia.com/ngs/), think of NGS as being an 'Internet of NATS' (literally an "InterNATS") and of Synadia as being an "InterNATS Service Provider".

## The Evolution of your NATS service infrastructure

You will typically start by running a single instance of nats-server on your local development machine, and have your applications connect to it while you do your application development and local testing.

Next you will probably want to start testing and running those applications and servers in a VPC, or a region or in some on-prem location, so you will deploy either single NATS server or clusters of NATS servers in your VPCs/regions/on-prem/etc... locations and in each location have the applications connect their local nats-server or nats-server cluster. You can then connect those local nats-servers or local nats-server clusters together by making them leaf nodes connecting to a 'backbone' cluster or super-cluster, or by connecting them directly together via gateway connections.

If you have very many client applications (i.e. applications deployed on end-user devices all over the Internet, or for example many IoT devices) or many servers in many locations you will then scale your NATS service infrastructure by deploying clusters of NATS servers in multiple locations and multiple cloud providers and VPCs, and connecting those clusters together into a global super-cluster and then devise a scheme to intelligently direct your client applications to the right 'closest' NATS server cluster.
 
## Running your own NATS service infrastructure

You can deploy and run your own NATS service infrastructure of nats-server instances, composed of servers, clusters of servers, super-cluster and leaf node NATS servers.

### Virtualization and containerization considerations

While you can certainly use container orchestration systems such as Kubernetes, Nomad or Docker Swarm to deploy your infrastructure of NATS servers and very many people do so, our recommendation is for the NATS service infrastructure to be just that: **Infrastructure**. Meaning that it is _best_ if it runs **at the same level** as your container infrastructure, not _inside it_.

This is because each layer of virtualization, containerization and redirection can be a source of problems and delays, and container orchestration systems are there to provide a service (e.g. detecting that processes are still running or not and redirecting network traffic accordingly in order to provide a form of HA) that is already implemented much better and faster by NATS itself.

Ask yourself this question: if you wanted the best possible performance, reliability, and fastest fault-tolerance would you run your database servers in containers and using Kubernetes/Nomad/Swarm, or would you instead run them directly in VMs or as close to bare metal as you can?

NATS servers are effectively 'message routers'. They constantly get data over the network and send data over the network. If they are JetStream enabled they also constantly read and write to files. They are highly optimized and have many built-in heart-beats, failover and flow control mechanisms. The less the number of layers between the NATS server process, the network and disk, the faster it will work and the less the number of things that can break or places where there can be a configuration error. And you are not relying on some proxy, port mapping or DNS trickery in order for your client applications to be able to connect to the NATS server instance(s) as your container orchestration system moves them around while if running in a VM they could simply be restarted and clients would keep using the same well-known IP address or CNAME.