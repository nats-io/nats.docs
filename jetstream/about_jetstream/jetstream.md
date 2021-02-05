# Jetstream

JetStream was created to solve the problems identified with streaming in technology today - complexity, fragility, and a lack of scalability.  Some technologies address these better than others, but no current streaming technology is truly multi-tenant, horizontally scalable, and supports multiple deployment models.  No technology we are aware of can scale from edge to cloud under the same security context while having complete deployment observability for operations.  

## Goals
JetStream was developed with the following goals in mind:

- The system must be easy to configure and operate and be observable.
- The system must be secure and operate well with NATS 2.0 security models.
- The system must scale horizontally and be applicable to a high ingestion rate.
- The system must support multiple use cases.
- The system must self heal and always be available.
- The system must have an API that is closer to core NATS.
- The system must allow NATS messages to be part of a stream as desired.
- The system must display payload agnostic behavior.
- The system must not have third party dependencies.

## High-Level Design and Features
In terms of deployment, a JetStream server is simply a NATS server with the JetStream subsystem enabled, launched with the `-js` flag with a configured server name and cluster name.  From a client perspective, it does not matter which servers are running JetStream so long as there is some route to a JetStream enabled server or servers.  This allows for a flexible deployment which to optimize resources for particular servers that will store streams versus very low overhead stateless servers, reducing OpEx and ultimately creating a scalable and manageable system.

## Feature List
- At-least-once delivery; exactly once within a window
- Store messages and replay by time or sequence
- Wildcard support
- Account aware
- Data at rest encryption
- Cleanse specific messages (GDPR)
- Horizontal scalability
- Persist Streams and replay via Consumers

JetStream is designed to bifurcate ingestion and consumption of messages to provide multiple ways to consume data from the same stream.  To that end, JetStream functionality is composed of server streams and server consumers.
