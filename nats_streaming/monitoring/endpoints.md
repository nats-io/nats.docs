### Endpoints

The following sections describe each supported monitoring endpoint: serverz, storez, clientsz, and channelsz.

#### /serverz

The endpoint [http://localhost:8222/streaming/serverz](http://localhost:8222/streaming/serverz) reports various general statistics.
```
{
  "cluster_id": "test-cluster",
  "server_id": "JEzjfVQS4JIEzM7lZmWHm9",
  "version": "0.14.2",
  "go": "go1.11.10",
  "state": "STANDALONE",
  "now": "2019-05-21T11:09:35.364637-06:00",
  "start_time": "2019-05-21T11:09:24.204869-06:00",
  "uptime": "11s",
  "clients": 0,
  "subscriptions": 0,
  "channels": 0,
  "total_msgs": 0,
  "total_bytes": 0
}
```

In clustering mode, there is an additional field that indicates the RAFT role of the given node. Here is an example:
```
{
  "cluster_id": "test-cluster",
  "server_id": "t9W9zbOIIi5Y9Guppxl0lF",
  "version": "0.14.2",
  "go": "go1.11.10",
  "state": "CLUSTERED",
  "role": "Follower",
  "now": "2019-05-21T11:10:15.765261-06:00",
  "start_time": "2019-05-21T11:10:12.21284-06:00",
  "uptime": "3s",
  "clients": 0,
  "subscriptions": 0,
  "channels": 0,
  "total_msgs": 0,
  "total_bytes": 0
}
```
The possible values are: `Leader`, `Follower` or `Candidate`.

#### /storez

The endpoint [http://localhost:8222/streaming/storez](http://localhost:8222/streaming/storez) reports information about the store.
```
{
  "cluster_id": "test-cluster",
  "server_id": "8AjZq57k4JY7cfKEvuZ8iF",
  "now": "2019-04-16T09:57:32.857406-06:00",
  "type": "MEMORY",
  "limits": {
    "max_channels": 100,
    "max_msgs": 1000000,
    "max_bytes": 1024000000,
    "max_age": 0,
    "max_subscriptions": 1000,
    "max_inactivity": 0
  },
  "total_msgs": 130691,
  "total_bytes": 19587140
}
```

#### /clientsz

The endpoint [http://localhost:8222/streaming/clientsz](http://localhost:8222/streaming/clientsz) reports more detailed information about the connected clients.

It uses a paging mechanism which defaults to 1024 clients.

You can control these via URL arguments (limit and offset). For example: [http://localhost:8222/streaming/clientsz?limit=1&offset=1](http://localhost:8222/streaming/clientsz?limit=1&offset=1).
```
{
  "cluster_id": "test-cluster",
  "server_id": "J3Odi0wXYKWKFWz5D5uhH9",
  "now": "2017-06-07T14:47:44.495254605+02:00",
  "offset": 1,
  "limit": 1,
  "count": 1,
  "total": 11,
  "clients": [
    {
      "id": "benchmark-sub-0",
      "hb_inbox": "_INBOX.jAHSY3hcL5EGFQGYmfayQK"
    }
  ]
}
```
You can also report detailed subscription information on a per client basis using `subs=1`. For example: [http://localhost:8222/streaming/clientsz?limit=1&offset=1&subs=1](http://localhost:8222/streaming/clientsz?limit=1&offset=1&subs=1).
```
{
  "cluster_id": "test-cluster",
  "server_id": "J3Odi0wXYKWKFWz5D5uhH9",
  "now": "2017-06-07T14:48:06.157468748+02:00",
  "offset": 1,
  "limit": 1,
  "count": 1,
  "total": 11,
  "clients": [
    {
      "id": "benchmark-sub-0",
      "hb_inbox": "_INBOX.jAHSY3hcL5EGFQGYmfayQK",
      "subscriptions": {
        "foo": [
          {
            "client_id": "benchmark-sub-0",
            "inbox": "_INBOX.jAHSY3hcL5EGFQGYmfayvC",
            "ack_inbox": "_INBOX.J3Odi0wXYKWKFWz5D5uhem",
            "is_durable": false,
            "is_offline": false,
            "max_inflight": 1024,
            "ack_wait": 30,
            "last_sent": 505597,
            "pending_count": 0,
            "is_stalled": false
          }
        ]
      }
    }
  ]
}
```
You can select a specific client based on its client ID with `client=<id>`, and get also get detailed statistics with `subs=1`. For example: [http://localhost:8222/streaming/clientsz?client=me&subs=1](http://localhost:8222/streaming/clientsz?client=me&subs=1).
```
{
  "id": "me",
  "hb_inbox": "_INBOX.HG0uDuNtAPxJQ1lVjIC2sr",
  "subscriptions": {
    "foo": [
      {
        "client_id": "me",
        "inbox": "_INBOX.HG0uDuNtAPxJQ1lVjIC389",
        "ack_inbox": "_INBOX.Q9iH2gsDPN57ZEvqswiYSL",
        "is_durable": false,
        "is_offline": false,
        "max_inflight": 1024,
        "ack_wait": 30,
        "last_sent": 0,
        "pending_count": 0,
        "is_stalled": false
      }
    ]
  }
}
```

#### /channelsz

The endpoint [http://localhost:8222/streaming/channelsz](http://localhost:8222/streaming/channelsz) reports the list of channels.
```
{
  "cluster_id": "test-cluster",
  "server_id": "J3Odi0wXYKWKFWz5D5uhH9",
  "now": "2017-06-07T14:48:41.680592041+02:00",
  "offset": 0,
  "limit": 1024,
  "count": 2,
  "total": 2,
  "names": [
    "bar"
    "foo"
  ]
}
```
It uses a paging mechanism which defaults to 1024 channels.

You can control these via URL arguments (limit and offset). For example: [http://localhost:8222/streaming/channelsz?limit=1&offset=1](http://localhost:8222/streaming/channelsz?limit=1&offset=1).
```
{
  "cluster_id": "test-cluster",
  "server_id": "J3Odi0wXYKWKFWz5D5uhH9",
  "now": "2017-06-07T14:48:41.680592041+02:00",
  "offset": 1,
  "limit": 1,
  "count": 1,
  "total": 2,
  "names": [
    "foo"
  ]
}
```
You can also get the list of subscriptions with `subs=1`. For example: [http://localhost:8222/streaming/channelsz?limit=1&offset=0&subs=1](http://localhost:8222/streaming/channelsz?limit=1&offset=0&subs=1).
```
{
  "cluster_id": "test-cluster",
  "server_id": "J3Odi0wXYKWKFWz5D5uhH9",
  "now": "2017-06-07T15:01:02.166116959+02:00",
  "offset": 0,
  "limit": 1,
  "count": 1,
  "total": 2,
  "channels": [
    {
      "name": "bar",
      "msgs": 0,
      "bytes": 0,
      "first_seq": 0,
      "last_seq": 0,
      "subscriptions": [
        {
          "client_id": "me",
          "inbox": "_INBOX.S7kTJjOcToXiJAzGWgINit",
          "ack_inbox": "_INBOX.Y04G5pZxlint3yPXrSTjTV",
          "is_durable": false,
          "is_offline": false,
          "max_inflight": 1024,
          "ack_wait": 30,
          "last_sent": 0,
          "pending_count": 0,
          "is_stalled": false
        }
      ]
    }
  ]
}
```
You can select a specific channel based on its name with `channel=name`. For example: [http://localhost:8222/streaming/channelsz?channel=foo](http://localhost:8222/streaming/channelsz?channel=foo).
```
{
  "name": "foo",
  "msgs": 649234,
  "bytes": 97368590,
  "first_seq": 1,
  "last_seq": 649234
}
```
And again, you can get detailed subscriptions with `subs=1`. For example: [http://localhost:8222/streaming/channelsz?channel=foo&subs=1](http://localhost:8222/streaming/channelsz?channel=foo&subs=1).
```
{
  "name": "foo",
  "msgs": 704770,
  "bytes": 105698990,
  "first_seq": 1,
  "last_seq": 704770,
  "subscriptions": [
    {
      "client_id": "me",
      "inbox": "_INBOX.jAHSY3hcL5EGFQGYmfayvC",
      "ack_inbox": "_INBOX.J3Odi0wXYKWKFWz5D5uhem",
      "is_durable": false,
      "is_offline": false,
      "max_inflight": 1024,
      "ack_wait": 30,
      "last_sent": 704770,
      "pending_count": 0,
      "is_stalled": false
    },
    {
      "client_id": "me2",
      "inbox": "_INBOX.jAHSY3hcL5EGFQGYmfaywG",
      "ack_inbox": "_INBOX.J3Odi0wXYKWKFWz5D5uhjV",
      "is_durable": false,
      "is_offline": false,
      "max_inflight": 1024,
      "ack_wait": 30,
      "last_sent": 704770,
      "pending_count": 0,
      "is_stalled": false
    },
    (...)
  ]
}
```

For durables that are currently running, the `is_offline` field is set to `false`. Here is an example:
```
{
  "name": "foo",
  "msgs": 0,
  "bytes": 0,
  "first_seq": 0,
  "last_seq": 0,
  "subscriptions": [
    {
      "client_id": "me",
      "inbox": "_INBOX.P23kNGFnwC7KRg3jIMB3IL",
      "ack_inbox": "_STAN.ack.pLyMpEyg7dgGZBS7jGXC02.foo.pLyMpEyg7dgGZBS7jGXCaw",
      "durable_name": "dur",
      "is_durable": true,
      "is_offline": false,
      "max_inflight": 1024,
      "ack_wait": 30,
      "last_sent": 0,
      "pending_count": 0,
      "is_stalled": false
    }
  ]
}
```

When that same durable goes offline, `is_offline` is be set to `true`. Although the client is possibly no longer connected (and would not appear in the `clientsz` endpoint), the `client_id` field is still displayed here.
```
{
  "name": "foo",
  "msgs": 0,
  "bytes": 0,
  "first_seq": 0,
  "last_seq": 0,
  "subscriptions": [
    {
      "client_id": "me",
      "inbox": "_INBOX.P23kNGFnwC7KRg3jIMB3IL",
      "ack_inbox": "_STAN.ack.pLyMpEyg7dgGZBS7jGXC02.foo.pLyMpEyg7dgGZBS7jGXCaw",
      "durable_name": "dur",
      "is_durable": true,
      "is_offline": true,
      "max_inflight": 1024,
      "ack_wait": 30,
      "last_sent": 0,
      "pending_count": 0,
      "is_stalled": false
    }
  ]
}
```
