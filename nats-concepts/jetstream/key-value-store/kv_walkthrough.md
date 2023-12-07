# Key/Value Store Walkthrough

## Prerequisite: enabling JetStream

If you are running a local `nats-server` stop it and restart it with JetStream enabled using `nats-server -js` (if that's not already done)

You can then check that JetStream is enabled by using

```shell
nats account info
```

```
Connection Information:

               Client ID: 6
               Client IP: 127.0.0.1
                     RTT: 64.996µs
       Headers Supported: true
         Maximum Payload: 1.0 MiB
           Connected URL: nats://127.0.0.1:4222
       Connected Address: 127.0.0.1:4222
     Connected Server ID: ND2XVDA4Q363JOIFKJTPZW3ZKZCANH7NJI4EJMFSSPTRXDBFG4M4C34K

JetStream Account Information:

           Memory: 0 B of Unlimited
          Storage: 0 B of Unlimited
          Streams: 0 of Unlimited
        Consumers: 0 of Unlimited 
```

If you see the below instead then JetStream is _not_ enabled

```
JetStream Account Information:

   JetStream is not supported in this account
```

## Creating a KV bucket

Just like you have to create streams before you can use them, you need to first create a 'KV bucket' using `nats kv add <KV Bucket Name>`:

```shell
nats kv add my_kv
```

```
my_kv Key-Value Store Status

         Bucket Name: my_kv
        History Kept: 1
 Maximum Bucket Size: unlimited
  Maximum Value Size: unlimited
     Bucket Location: unknown
       Values Stored: 0
  Backing Store Name: KV_my_kv
```

## Storing a value

Now that we have a bucket, we can use it to 'put' (store) values at keys:

```shell
nats kv put my_kv Key1 Value1
```

which should return `Value1`

## Getting a value

Now that we have value stored at key "Key1" we can retrieve that value with a 'get':

```shell
nats kv get my_kv Key1
```

```
my_kv > Key1 created @ 12 Oct 21 20:08 UTC

Value1
```

## Deleting a value

You can always delete a Key/Value entry by using `nats kv del my_kv Key1`

## Watching a K/V Store

A functionality (normally not provided by Key/Value stores) is available with the NATS KV Store is the ability to 'watch' a bucket (or a particular key in that bucket) and receive real-time updates to changes in the store.

For example run `nats kv watch my_kv`: this will start a watcher on the bucket we have just created earlier. If you followed this walkthrough the last operation that happened on the key is that it was deleted. Because by default the KV bucket is set with a history size of one (i.e. it keeps only the last change) and the last operation on the bucket was a delete of the value associated with the key "Key1" that is the only thing that get received by the watcher:

```shell
nats kv watch my_kv
```

```
[2021-10-12 13:15:03] DEL my_kv > Key1
```

Keep that `nats kv watch` running and in another window do another 'put'

```shell
nats kv put my_kv Key1 Value2
```

As soon as that command is run you will see that put event received by the watcher:

```shell
[2021-10-12 13:25:14] PUT my_kv > Key1: Value2
```

## Cleaning up

Once you are finished playing, you can easily delete the KV bucket and release the resource associated with it by using:

```shell
nats kv rm my_kv
```
