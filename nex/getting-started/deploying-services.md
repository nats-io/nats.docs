# Deploying Nex Services
There are a number of ways to deploy a service with Nex. For this guide we'll cover the easiest option, `devrun`, which makes a number of assumptions about the fact that you're running in a development environment. For all of the full production options, take a look at the reference section or read through the CLI's extended help text.

Make sure that your node is still up and running by making sure that it's still discoverable via `nex`:

```
$ nex node ls
╭─────────────────────────────────────────────────────────────────────────────────────────╮
│                                   NATS Execution Nodes                                  │
├──────────────────────────────────────────────────────────┬─────────┬────────┬───────────┤
│ ID                                                       │ Version │ Uptime │ Workloads │
├──────────────────────────────────────────────────────────┼─────────┼────────┼───────────┤
│ NCOBPU3MCEA7LF6XADFD4P74CHW2OL6GQZYPPRRNPDSBNQ5BJPFHHQB5 │ 0.0.1   │ 10m15s │         0 │
╰──────────────────────────────────────────────────────────┴─────────┴────────┴───────────╯
```

## Sending a Deployment Request
We start services by issuing a deployment (which ends up being equivalent to "run" for services) request to a specific node. When we use the `devrun` command, the CLI makes it easy on us by choosing the first discovered node as the target.

The next thing we need on hand when calling `devrun` is the statically linked binary. Deploying workloads also requires a publisher key and an encryption **xkey**, but `devrun` will create both of those if you haven't done so already.

As you saw, the echo service we built requires the `NATS_URL` environment variable. To start the echo service on the first available Nex node and supply an environment variable, issue the following command (your path to the `echoservice` file may differ):

```
$ nex devrun ../examples/echoservice/echoservice nats_url=nats://192.168.127.1:4222
Reusing existing issuer account key: /home/kevin/.nex/issuer.nk
Reusing existing publisher xkey: /home/kevin/.nex/publisher.xk
🚀 Workload 'echoservice' accepted. You can now refer to this workload with ID: cmji29n52omrb71g07a0 on node NBS3Y3NWXLTFNC73XMVD6USFJF2H5QXTLEJQNOPEBPYDUDVB5YYYZOGI
```

There's a couple of important pieces of information here. The first is that we've reused some existing keys. If this is your first time running a workload, you'll see those two keys get created. Next, we see that we got an acknowledgement from the target node that included the machine/workload ID.

The address `192.168.127.1` is the IP address of the _host_ (the network on which `nex` is running), as seen by any code running _inside_ the firecracker VM (guest). We use this as a default because it makes things easy during development, but keep in mind that if you supply your own custom CNI configurations, the IP address that works in your environment may be different.

Let's run the same commands we ran before to test out our service.

```
$ nats micro ls
╭──────────────────────────────────────────────────────────────╮
│                      All Micro Services                      │
├─────────────┬─────────┬────────────────────────┬─────────────┤
│ Name        │ Version │ ID                     │ Description │
├─────────────┼─────────┼────────────────────────┼─────────────┤
│ EchoService │ 1.0.0   │ NsMaTbN7u5ZPUNN47bSEI6 │             │
╰─────────────┴─────────┴────────────────────────┴─────────────╯
```

And we can test this service out the same way we did before:

```
nats req svc.echo 'hey'
19:40:22 Sending request on "svc.echo"
19:40:22 Received with rtt 446.27µs
hey
```

Now let's interrogate a single execution node to see the workload there (again note that your node ID will differ from the one below):

```
$ nex node info NBS3Y3NWXLTFNC73XMVD6USFJF2H5QXTLEJQNOPEBPYDUDVB5YYYZOGI
NEX Node Information

         Node: NBS3Y3NWXLTFNC73XMVD6USFJF2H5QXTLEJQNOPEBPYDUDVB5YYYZOGI
         Xkey: XASQSWNSIKHM5MDKDOGPSPGBA3V6JMETMIJK2YTXKAJZNMAFKXER5RUK
      Version: 0.0.1
       Uptime: 8m47s
         Tags: nex.arch=amd64, nex.cpucount=8, nex.os=linux, simple=true

Memory in kB:

           Free: 33,545,884
      Available: 56,529,644
          Total: 63,883,232

Workloads:

             Id: cmji29n52omrb71g07a0
        Healthy: true
        Runtime: 8m47s
           Name: echoservice
    Description: Workload published in devmode
```

And just to prove that we're not interfering with the way the workload executes at all, we can get the service stats and see that it is indeed still keeping track of request counts:

```
$ nats micro info EchoService
Service Information

          Service: EchoService (NsMaTbN7u5ZPUNN47bSEI6)
      Description: 
          Version: 1.0.0

Endpoints:

               Name: default
            Subject: svc.echo
        Queue Group: q

Statistics for 1 Endpoint(s):

  default Endpoint Statistics:

           Requests: 1 in group q
    Processing Time: 15µs (average 15µs)
            Started: 2024-01-16 19:40:09 (7m46s ago)
             Errors: 0
```
That's it! Congratulations, you've got a running Nex node that is ready and willing to accept and run any kind of workload you can throw at it! In the next section of this guide, we'll create, deploy, and manage functions. To keep things easy, you should keep your Nex node running throughout the rest of this guide.
