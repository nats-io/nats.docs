# Creating a NATS Super Cluster in Digital Ocean with Helm

Let's create a super cluster using NATS Gateways. First let's create 3 different clusters in NYC, Amsterdam, and San Francisco:

```bash
doctl kubernetes cluster create nats-k8s-nyc1 --count 3 --region nyc1
doctl kubernetes cluster create nats-k8s-sfo2 --count 3 --region sfo2
doctl kubernetes cluster create nats-k8s-ams3 --count 3 --region ams3
```

Next, open up the firewall across the 3 regions to be able to access the client, leafnode and gateways ports:

```bash
for firewall in `doctl compute firewall list | tail -n 3 | awk '{print $1}'`; do
  doctl compute firewall add-rules $firewall --inbound-rules protocol:tcp,ports:4222,address:0.0.0.0/0
  doctl compute firewall add-rules $firewall --inbound-rules protocol:tcp,ports:7422,address:0.0.0.0/0
  doctl compute firewall add-rules $firewall --inbound-rules protocol:tcp,ports:7522,address:0.0.0.0/0
done
```

For this setup, we will create a super cluster using the external IPs from the nodes of the 3 clusters. For a production type of setup, it is recommended to use a DNS entry and an A record for each one of the servers.

```bash
for ctx in do-ams3-nats-k8s-ams3 do-nyc1-nats-k8s-nyc1 do-sfo2-nats-k8s-sfo2; do
  echo "name: $ctx"
  for externalIP in `kubectl --context $ctx get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="ExternalIP")].address}'`; do 
    echo "- nats://$externalIP:7522"; 
  done
  echo
done
```

The Helm definition would look as follows for the 3 clusters:

```yaml
# super-cluster.yaml
nats:
  externalAccess: true
  logging:
    debug: false
    trace: false

cluster:
  enabled: true

gateway:
  enabled: true

  # NOTE: defined via --set gateway.name="$ctx"
  # name: $ctx

  gateways:
  - name: do-ams3-nats-k8s-ams3
    urls:
    - nats://142.93.251.181:7522
    - nats://161.35.12.245:7522
    - nats://161.35.2.153:7522

  - name: do-nyc1-nats-k8s-nyc1
    urls:
    - nats://142.93.251.181:7522
    - nats://161.35.12.245:7522
    - nats://161.35.2.153:7522

  - name: do-sfo2-nats-k8s-sfo2
    urls:
    - nats://142.93.251.181:7522
    - nats://161.35.12.245:7522
    - nats://161.35.2.153:7522

natsbox:
  enabled: true
```

Let's deploy the super cluster with Helm using the name of cluster as the name of the gateway:

```bash
for ctx in do-ams3-nats-k8s-ams3 do-nyc1-nats-k8s-nyc1 do-sfo2-nats-k8s-sfo2; do
  helm --kube-context $ctx install nats nats/nats -f super-cluster.yaml --set gateway.name=$ctx
done
```

That's it! It should now be possible to send some messages across regions:

```bash
# Start subscription in Amsterdam
nats-box:~# kubectl --context do-ams3-nats-k8s-ams3 exec -it nats-box -- /bin/sh -l
nats-box:~# nats sub -s nats hello

# Send messages from San Francisco region
nats-box:~# kubectl --context do-sfo2-nats-k8s-sfo2 exec -it nats-box -- /bin/sh -l
nats-box:~# nats pub -s nats hello 'Hello World!'

# From outside of k8s can use the external IPs
nats sub -s 142.93.251.181 hello
nats pub -s 161.35.2.153 hello 'Hello World!'
```

