# Embedding NATS Streaming

Embedding a NATS Streaming Server in your own code is easy. Simply import:

```
  stand "github.com/nats-io/nats-streaming-server/server"
```

(Note: we chose `stand` here, but you don't have to use that name)

Then if you want to use default options, it is as simple as doing:

```
  s, err := stand.RunServer("mystreamingserver")
```

If you want a more advance configuration, then you need to pass options. For instance, let's start the server with a file store instead of memory.

First import the stores package so we have access to the store type.

```
  stores "github.com/nats-io/nats-streaming-server/stores"
```

Then get the default options and override some of them:

```
  opts := stand.GetDefaultOptions()
  opts.StoreType = stores.TypeFile
  opts.FilestoreDir = "datastore"
  s, err := stand.RunServerWithOpts(opts, nil)
```

However, since the NATS Streaming Server project vendors NATS Server (that it uses as the communication layer with its clients and other servers in the cluster, there are some limitations.

If you were to import `github.com/nats-io/nats-server/server`, instantiate a NATS `Options` structure, configure it and pass it to the second argument of `RunServerWithOpts`, you would get a compiler error. For instance doing this does not work:

```
import (
  natsd "github.com/nats-io/nats-server/server"
  stand "github.com/nats-io/nats-streaming-server/server"
  stores "github.com/nats-io/nats-streaming-server/stores"
)

(...)

  nopts := &natsd.Options{}
  nopts.Port = 4223

  s, err := stand.RunServerWithOpts(nil, nopts)
```

You would get:

```
./myapp.go:36:35: cannot use nopts (type *"myapp/vendor/github.com/nats-io/nats-server/server".Options) as type *"myapp/vendor/github.com/nats-io/nats-streaming-server/vendor/github.com/nats-io/gnatsd/server".Options in argument to "myapp/vendor/github.com/nats-io/nats-streaming-server/server".RunServerWithOpts
```

To workaround this issue, the NATS Streaming Server package provides a function `NewNATSOptions()` that is suitable for this approach:

```
  nopts := stand.NewNATSOptions()
  nopts.Port = 4223

  s, err := stand.RunServerWithOpts(nil, nopts)
```

That will work.

But, if you want to do advanced NATS configuration that requires types or interfaces that belong to the NATS Server package, then this approach won't work. In this case you need to run the NATS Server indepently and have the NATS Streaming Server connects to it. Here is how:

```
  // This configure the NATS Server using natsd package
  nopts := &natsd.Options{}
  nopts.HTTPPort = 8222
  nopts.Port = 4223

  // Setting a customer client authentication requires the NATS Server Authentication interface.
  nopts.CustomClientAuthentication = &myCustomClientAuth{}

  // Create the NATS Server
  ns := natsd.New(nopts)

  // Start it as a go routine
  go ns.Start()

  // Wait for it to be able to accept connections
  if !ns.ReadyForConnections(10 * time.Second) {
    panic("not able to start")
  }

  // Get NATS Streaming Server default options
  opts := stand.GetDefaultOptions()

  // Point to the NATS Server with host/port used above
  opts.NATSServerURL = "nats://localhost:4223"

  // Now we want to setup the monitoring port for NATS Streaming.
  // We still need NATS Options to do so, so create NATS Options
  // using the NewNATSOptions() from the streaming server package.
  snopts := stand.NewNATSOptions()
  snopts.HTTPPort = 8223

  // Now run the server with the streaming and streaming/nats options.
  s, err := stand.RunServerWithOpts(opts, snopts)
  if err != nil {
    panic(err)
  }
```

The above seem involved, but it really only if you use very advanced NATS Server options.