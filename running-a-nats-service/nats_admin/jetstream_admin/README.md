# Administration & Usage from CLI

Once the server is running it's time to use the management tool. This can be downloaded from the [GitHub Release Page](https://github.com/nats-io/natscli/releases/). On OS X homebrew can be used to install the latest version:

```shell
brew tap nats-io/nats-tools
brew install nats-io/nats-tools/nats
nats --help
nats cheat
```

We'll walk through the above scenario and introduce features of the CLI and of JetStream as we recreate the setup above.

Throughout this example, we'll show other commands like `nats pub` and `nats sub` to interact with the system. These are normal existing core NATS commands and JetStream is fully usable by only using core NATS.

We'll touch on some additional features but please review the section on the design model to understand all possible permutations.

