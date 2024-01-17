# Starting a Node
If we've performed our pre-flight checks and they've passed, then starting a Nex node is as easy as pointing the `nex node` command at the checked configuration file.

## Superuser Permissions
The `nex` node process makes a number of secure kernel calls in order to set up [CNI](https://www.cni.dev/) networks and start the `firecracker` binary. While it might be possible to manually craft a user with just the right set of permissions such that `sudo` is unnecessary, when you're in your development loop, `sudo` is probably the easiest way to go.


## Node Up
The command to bring up a new node process is `node up`. There are a lot of options that you can specify here, as well as options available in the configuration file. All of those details can be found in the reference section.

```
$ sudo ./nex node up --config=/home/kevin/simple.json
INFO[0000] Established node NATS connection to: nats://127.0.0.1:4222 
INFO[0000] Loaded node configuration from '/home/kevin/simple.json' 
INFO[0000] Virtual machine manager starting             
INFO[0000] Internal NATS server started                  client_url="nats://0.0.0.0:41339"
INFO[0000] Use this key as the recipient for encrypted run requests  public_xkey=XDJJVJLRTWBIOHEEUPSNAAUACO6ZRW4WP65MXMGOX2WBGNCELLST5TWI
INFO[0000] NATS execution engine awaiting commands       id=NCOBPU3MCEA7LF6XADFD4P74CHW2OL6GQZYPPRRNPDSBNQ5BJPFHHQB5 version=0.0.1
INFO[0000] Called startVMM(), setting up a VMM on /tmp/.firecracker.sock-370707-cmjg61n52omq8dovolmg 
INFO[0000] VMM metrics disabled.                        
INFO[0000] refreshMachineConfiguration: [GET /machine-config][200] getMachineConfigurationOK  &{CPUTemplate: MemSizeMib:0xc0004ac108 Smt:0xc0004ac113 TrackDirtyPages:false VcpuCount:0xc0004ac100} 
INFO[0000] PutGuestBootSource: [PUT /boot-source][204] putGuestBootSourceNoContent  
INFO[0000] Attaching drive /tmp/rootfs-cmjg61n52omq8dovolmg.ext4, slot 1, root true. 
INFO[0000] Attached drive /tmp/rootfs-cmjg61n52omq8dovolmg.ext4: [PUT /drives/{drive_id}][204] putGuestDriveByIdNoContent  
INFO[0000] Attaching NIC tap0 (hwaddr 5a:65:8e:fa:7f:25) at index 1 
INFO[0000] startInstance successful: [PUT /actions][204] createSyncActionNoContent  
INFO[0000] SetMetadata successful                       
INFO[0000] Machine started                               gateway=192.168.127.1 hosttap=tap0 ip=192.168.127.6 nats_host=192.168.127.1 nats_port=41339 netmask=ffffff00 vmid=cmjg61n52omq8dovolmg
INFO[0000] Adding new VM to warm pool                    ip=192.168.127.6 vmid=cmjg61n52omq8dovolmg
INFO[0001] Received agent handshake                      message="Host-supplied metadata" vmid=cmjg61n52omq8dovolmg
```

This might seem a bit spammy, but the vast majority of this is full of useful information. The first thing you see is that the node established a connection to NATS on `127.0.0.1:4222`. This is the _control plane_ connection, e.g. the connection through which Nex remote management commands are issued. This should _not_ be confused with the NATS connection that individual workloads use, as that should absolutely be a different connection for security reasons.

## Encrypted Environment Variables
The next two lines of the node output log also give important details:
```
INFO[0000] Use this key as the recipient for encrypted run requests  public_xkey=XDJJVJLRTWBIOHEEUPSNAAUACO6ZRW4WP65MXMGOX2WBGNCELLST5TWI
INFO[0000] NATS execution engine awaiting commands       id=NCOBPU3MCEA7LF6XADFD4P74CHW2OL6GQZYPPRRNPDSBNQ5BJPFHHQB5 version=0.0.1
```
First, you see an **Xkey**, which is the _target public key_ that should be used when encrypting data bound for this particular node. This is used to encrypt the environment variables that are supplied with workload deployment requests. Don't worry, though, the `nex` CLI takes care of this for you.

## Filling the Virtual Machine Pool
Next up in the node's output log is a line like this one:
```
INFO[0000] Machine started                               gateway=192.168.127.1 hosttap=tap0 ip=192.168.127.6 nats_host=192.168.127.1 nats_port=41339 netmask=ffffff00 vmid=cmjg61n52omq8dovolmg
```
This indicates that we've actually started a Firecracker virtual machine and, for information and debugging purposes, we output the gateway IP address, the tap device name, the internal NATS host, internal nats port, and ultimately the ID of the virtual machine.

The Nex node process keeps a pool of "warm" virtual machines, the size of which is configurable in the node configuration file. When you issue a work deployment request, the next available warm VM is taken from the pool and the work is dispatched to it.

## Readiness Indicator
Probably the single most important piece of log output is the indication of a successful _handshake_. Each time we attempt to add a virtual machine to the pool, the **agent** running inside tries to make contact with the host node process. If this exchange is successful, you'll see the following message:

```
INFO[0001] Received agent handshake                      message="Host-supplied metadata" vmid=cmjg61n52omq8dovolmg
```

If you don't, and instead see an error indicating a timeout or failure to perform the handshake, the node will terminate. If a node can't properly dispense virtual machines, then there's no reason for it to continue running.

## Interrogating Nodes
With this node still running, open another terminal and issue the following `nex` command:

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
This will show you the summary information of all discovered nodes. Any given NATS infrastructure can run as many Nex nodes in as many locations and clusters as desired.

Now let's move on to deploying our echo service.