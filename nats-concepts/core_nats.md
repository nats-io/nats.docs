# Core NATS

What is referred to as 'Core NATS' is the base set of functionalities and qualities of service offered by a nats service infrastructure where none of the `nats-server` instances are configured to enable JetStream.

The 'Core NATS' functionalities are publish/subscribe with subject-based-addressing and queuing, with qualities of service going from 'at most once' to 'at least once'.