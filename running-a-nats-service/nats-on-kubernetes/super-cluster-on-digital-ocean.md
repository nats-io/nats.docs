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

## Using leafnodes and NATS super clusters to communicate across regions

You can also create a multi-region NATS topology by using leafnodes connecting to a NATS super cluster (which could also be a much simpler way!).

```sh
doctl kubernetes cluster create nats-k8s-nyc1 --count 3 --region nyc1
doctl kubernetes cluster create nats-k8s-sfo2 --count 3 --region sfo2
doctl kubernetes cluster create nats-k8s-ams3 --count 3 --region ams3
```

Next, open up the firewall across the 3 regions to be able to access the client, leafnode and gateways ports:

```sh
for firewall in `doctl compute firewall list | tail -n 3 | awk '{print $1}'`; do
  doctl compute firewall add-rules $firewall --inbound-rules protocol:tcp,ports:4222,address:0.0.0.0/0
done
```

The Helm definition would look as follows for the 3 clusters:

```yaml
# nats.yaml
leafnodes:
  enabled: true
  remotes:
    - url: tls://connect.ngs.global:7422
      credentials:
        secret:
          name: ngs-creds
          key: NGS.creds

natsbox:
  enabled: true
```

Let's deploy the super cluster with Helm using the name of cluster as the name of the gateway:

```sh
for ctx in do-ams3-nats-k8s-ams3 do-nyc1-nats-k8s-nyc1 do-sfo2-nats-k8s-sfo2; do
  kubectl --context $ctx create secret generic ngs-creds --from-file $HOME/.nkeys/creds/synadia/NGS/NGS.creds
  helm --kube-context $ctx install nats nats/nats -f nats.yaml
done
```

It should now be possible to send some messages across regions:

```sh
# Start subscription in Amsterdam
nats-box:~# kubectl --context do-ams3-nats-k8s-ams3 exec -it nats-box -- /bin/sh -l
nats-box:~# nats-sub -s nats hello

# Send messages from San Francisco region
nats-box:~# kubectl --context do-sfo2-nats-k8s-sfo2 exec -it nats-box -- /bin/sh -l
nats-box:~# nats-pub -s nats hello 'Hello World!'
```

Or from outside of k8s can use the external IPs:

```console
# Find the external ips from the nodes
$ for ctx in do-ams3-nats-k8s-ams3 do-nyc1-nats-k8s-nyc1 do-sfo2-nats-k8s-sfo2; do
  kubectl --context $ctx get nodes -o wide
done

NAME                               STATUS   ROLES    AGE   VERSION   INTERNAL-IP     EXTERNAL-IP      OS-IMAGE                       KERNEL-VERSION         CONTAINER-RUNTIME
nats-k8s-ams3-default-pool-3cifn   Ready    <none>   38m   v1.17.5   10.133.7.58     188.166.32.235   Debian GNU/Linux 9 (stretch)   4.19.0-0.bpo.6-amd64   docker://18.9.2
nats-k8s-ams3-default-pool-3ciq9   Ready    <none>   38m   v1.17.5   10.133.19.19    188.166.40.159   Debian GNU/Linux 9 (stretch)   4.19.0-0.bpo.6-amd64   docker://18.9.2
nats-k8s-ams3-default-pool-3ciqz   Ready    <none>   38m   v1.17.5   10.133.31.211   188.166.43.34    Debian GNU/Linux 9 (stretch)   4.19.0-0.bpo.6-amd64   docker://18.9.2
NAME                               STATUS   ROLES    AGE   VERSION   INTERNAL-IP     EXTERNAL-IP     OS-IMAGE                       KERNEL-VERSION         CONTAINER-RUNTIME
nats-k8s-nyc1-default-pool-3ciq4   Ready    <none>   37m   v1.17.5   10.136.75.202   161.35.125.69   Debian GNU/Linux 9 (stretch)   4.19.0-0.bpo.6-amd64   docker://18.9.2
nats-k8s-nyc1-default-pool-3ciqh   Ready    <none>   38m   v1.17.5   10.136.90.125   161.35.125.70   Debian GNU/Linux 9 (stretch)   4.19.0-0.bpo.6-amd64   docker://18.9.2
nats-k8s-nyc1-default-pool-3ciqk   Ready    <none>   37m   v1.17.5   10.136.65.137   161.35.125.66   Debian GNU/Linux 9 (stretch)   4.19.0-0.bpo.6-amd64   docker://18.9.2
NAME                               STATUS   ROLES    AGE   VERSION   INTERNAL-IP      EXTERNAL-IP      OS-IMAGE                       KERNEL-VERSION         CONTAINER-RUNTIME
nats-k8s-sfo2-default-pool-3ciq0   Ready    <none>   37m   v1.17.5   10.138.20.132    206.189.79.122   Debian GNU/Linux 9 (stretch)   4.19.0-0.bpo.6-amd64   docker://18.9.2
nats-k8s-sfo2-default-pool-3ciqd   Ready    <none>   37m   v1.17.5   10.138.4.194     64.225.124.243   Debian GNU/Linux 9 (stretch)   4.19.0-0.bpo.6-amd64   docker://18.9.2
nats-k8s-sfo2-default-pool-3ciqv   Ready    <none>   37m   v1.17.5   10.138.148.237   206.189.79.131   Debian GNU/Linux 9 (stretch)   4.19.0-0.bpo.6-amd64   docker://18.9.2
```

Send a message from Amsterdam to SFO via the super cluster connected with leafnodes:

```
$ nats-sub -s 188.166.32.235 hello        # From Amsterdam
$ nats-pub -s 206.189.79.131 hello world  #   To SFO
```
