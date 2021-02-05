## Administration and Usage from the CLI

Once the server is running it's time to use the management tool. This can be downloaded from the [GitHub Release Page](https://github.com/nats-io/natscli/releases/) or you can use the `synadia/jsm:latest` docker image. On OS X homebrew can be used to install the latest version:

```nohighlight
$ brew tap nats-io/nats-tools
$ brew install nats-io/nats-tools/nats
$ nats --help
usage: nats [<flags>] <command> [<args> ...]
NATS Utility

Flags:
      --help                     Show context-sensitive help (also try --help-long and --help-man).
      --version                  Show application version.
  -s, --server="localhost:4222"  NATS servers
      --creds=CREDS              User credentials
      --tlscert=TLSCERT          TLS public certifcate
      --tlskey=TLSKEY            TLS private key
      --tlsca=TLSCA              TLS certifcate authority chain
      --timeout=2s               Time to give JetStream to respond to queries

Commands:
  help [<command>...]
    Show help.
 ...
```

We'll walk through the above scenario and introduce features of the CLI and of JetStream as we recreate the setup above.

Throughout this example, we'll show other commands like `nats pub` and `nats sub` to interact with the system. These are normal existing core NATS commands and JetStream is fully usable by only using core NATS.

We'll touch on some additional features but please review the section on the design model to understand all possible permutations.
