nats sub foo

nats pub foo "Hello World"

nats sub 'foo.>'

nats pub foo.foo foo

nats pub foo.bar bar

nats reply foo.request "Server A Reply# {{Count}}"

nats request foo.request Hi

nats request foo.request --count 10 "Request {{Count}} @ {{Time}}"

nats stream create

nats consumer create

