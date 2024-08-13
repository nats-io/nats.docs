# Nex Host Services
If we're building cloud native/12-factor application components, then we agree that things like connection strings, credentials, database client libraries, etc, are all things that should be treated as _external services_, configured with _external configuration_. Very rarely does the typical application component care about _which_ key value store is supplying data, only that it gets the data the environment and those who operate it make available.

This is the driving philosophy behind host services. If you're using Nex, you're already deploying workloads that _consume_ NATS services. We make that much easier for functions by giving them access to managed resources such as key-value buckets, messaging subject spaces, object stores, and even HTTP clients.
