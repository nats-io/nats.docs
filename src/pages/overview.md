# Overview

**What is NATS?**  
NATS is a connective technology that powers modern distributed systems. A connective technology is responsible for addressing, discovery and exchanging of messages that drive the common patterns in distributed systems; asking and answering questions, aka services/microservices, and making and processing statements, or stream processing.  
  
**Challenges faced by modern distributed systems**  
Modern distributed systems are defined by an ever increasing number of hyper-connected moving parts and the additional data they generate. They employ both services and streams to drive business value. They are also being defined by location independence and mobility, and not just for things we would typically recognize as front end technologies. Today’s systems and the backend processes, microservices and stream processing are being asked to be location independent and mobile as well, all while being secure.

These modern systems present challenges to technologies that have been used to connect mobile front ends to fairly static backends. These incumbent technologies typically manage addressing and discovery via hostname \(DNS\) or IP and port, utilize a 1:1 communication pattern, and have multiple different security patterns for authentication and authorization. Although not perfect, incumbent technologies have been good enough in many situations, but times are changing quickly. As microservices, functions, and stream processing are being asked to move to the edge, these technologies and the assumptions they make are being challenged.

## What makes the NATS connective technology unique for these modern systems?

**Effortless M:N connectivity:** NATS manages addressing and discovery based on subjects and not hostname and ports. Defaulting to M:N communications, which is a superset of 1:1, meaning it can do 1:1 but can also do so much more. If you have a 1:1 system that is successful in development, ask how many other moving parts are required for production to work around the assumption of 1:1? Things like load balancers, log systems, and network security models, as well as proxies and sidecars. If your production system requires all of these things just to get around the fact that the connective technology being used, e.g. HTTP or gRPC, is 1:1, it’s time to give NATS.io a look.

**Deploy anywhere:** NATS can be deployed nearly anywhere; on bare metal, in a VM, as a container, inside K8S, on a device, or whichever environment you choose. NATS runs well within deployment frameworks or without.

**Secure:** Similarly, NATS is secure by default and makes no requirements on network perimeter security models. When you start considering mobilizing your backend microservices and stream processors, many times the biggest roadblock is security.

### Scalable, Future-Proof Deployments

NATS infrastructure and clients communicate all topology changes in real-time. This means that NATS clients do not need to change when NATS deployments change. Having to change clients with deployments would be like having to reboot your phone every time your cell provider added or changed a cell tower. This sounds ridiculous of course, but think about how many systems today have their front ends tied so closely to the backend, that any change requires a complete front end reboot or at least a reconfiguration. NATS clients and applications need no such change when backend servers are added and removed and changed. Even DNS is only used to bootstrap first contact, after that, NATS handles endpoint locations transparently.

### Hybrid Deployments

Another advantage to utilizing a NATS is that it allows a hybrid mix of SaaS/Utility computing with separately owned and operated systems. Meaning you can have a shared NATS service with core microservices, streams and stream processing be extended by groups or individuals who have a need to run their own NATS infrastructure. You are not forced to choose one or the other.

### Adaptability

Today’s systems will fall short with new demands. As modern systems continue to evolve and utilize more components and process more data, supporting patterns beyond 1:1 communications, with addressing and discovery tied to DNS is critical. Foundational technologies like NATS promise the most return on investment. Incumbent technologies will not work as modern systems unify cloud, Edge, IoT and beyond. NATS does.

### Use Cases

NATS can run anywhere, from large servers and cloud instances, through edge gateways and even IoT devices. Use cases for NATS include:

* Cloud Messaging
    * Services \(microservices, service mesh\)
    * Event/Data Streaming \(observability, analytics, ML/AI\)
* Command and Control
    * IoT and Edge
    * Telemetry / Sensor Data / Command and Control
* Augmenting or Replacing Legacy Messaging Systems

