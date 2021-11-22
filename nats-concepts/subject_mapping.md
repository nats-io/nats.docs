# Subject Mapping and Traffic Shaping

Subject mapping is a very powerful feature of the NATS server, useful for canary deployments, A/B testing, chaos testing, and migrating to a new subject namespace.

## Simple Mapping

The example of `foo:bar` is straightforward. All messages the server receives on subject `foo` are remapped and can be received by clients subscribed to `bar`.

## Subject Token Reordering

Wildcard tokens may be referenced via `$<position>`. For example, the first wildcard token is $1, the second is $2, etc. Referencing these tokens can allow for reordering.

For example with this mapping `bar.*.*: baz.$2.$1`, messages that were originally published to `bar.a.b` are remapped in the server to `baz.b.a`. Messages arriving at the server on `bar.one.two` would be mapped to `baz.two.one`, and so forth.

## Weighted Mappings for A/B Testing or Canary Releases

Traffic can be split by percentage from one subject to multiple subjects. Here's an example for canary deployments, starting with version 1 of your service.

Applications would make requests of a service at `myservice.requests`. The responders doing the work of the server would subscribe to `myservice.requests.v1`. Your configuration would look like this:

```
  myservice.requests: [
    { destination: myservice.requests.v1, weight: 100% }
  ]
```

All requests to `myservice.requests` will go to version 1 of your service.

When version 2 comes along, you'll want to test it with a canary deployment. Version 2 would subscribe to `myservice.requests.v2`. Launch instances of your service.

Update the configuration file to redirect some portion of the requests made to `myservice.requests` to version 2 of your service.

For example the configuration below means 98% of the requests will be sent to version 1 and 2% to version 2.

```
    myservice.requests: [
        { destination: myservice.requests.v1, weight: 98% },
        { destination: myservice.requests.v2, weight: 2% }
    ]
```

Once you've determined Version 2 is stable you can switch 100% of the traffic over to it and you can then shutdown the version 1 instance of your service.

## Traffic Shaping in Testing

Traffic shaping is also useful in testing. You might have a service that runs in QA that simulates failure scenarios which could receive 20% of the traffic to test the service requestor.

`myservice.requests.*: [{ destination: myservice.requests.$1, weight: 80% }, { destination: myservice.requests.fail.$1, weight: 20% }`

## Artificial Loss

Alternatively, introduce loss into your system for chaos testing by mapping a percentage of traffic to the same subject. In this drastic example, 50% of the traffic published to `foo.loss.a` would be artificially dropped by the server.

`foo.loss.>: [ { destination: foo.loss.>, weight: 50% } ]`

You can both split and introduce loss for testing. Here, 90% of requests would go to your service, 8% would go to a service simulating failure conditions, and the unaccounted for 2% would simulate message loss.

`myservice.requests: [{ destination: myservice.requests.v3, weight: 90% }, { destination: myservice.requests.v3.fail, weight: 8% }]` the remaining 2% is "lost"
