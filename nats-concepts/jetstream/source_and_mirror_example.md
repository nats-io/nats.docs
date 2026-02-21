# Пример конфигурации Source и Mirror

Потоки с конфигурациями source и mirror лучше всего управляются через клиентский API. Если вы собираетесь создавать такую конфигурацию из командной строки с NATS CLI, следует использовать JSON‑конфигурацию. 

````
nats stream add --config stream_with_sources.json
````

## Пример конфигурации потока с двумя источниками

**Минимальный пример**
````
{
  "name": "SOURCE_TARGET",
  "subjects": [
    "foo1.ext.*",
    "foo2.ext.*"
  ],
  "discard": "old",
  "duplicate_window": 120000000000,
  "sources": [
    {
      "name": "SOURCE1_ORIGIN",
    },
  ],
  "deny_delete": false,
  "sealed": false,
  "max_msg_size": -1,
  "allow_rollup_hdrs": false,
  "max_bytes": -1,
  "storage": "file",
  "allow_direct": false,
  "max_age": 0,
  "max_consumers": -1,
  "max_msgs_per_subject": -1,
  "num_replicas": 1,
  "name": "SOURCE_TARGET",
  "deny_purge": false,
  "compression": "none",
  "max_msgs": -1,
  "retention": "limits",
  "mirror_direct": false
}
````

**С дополнительными опциями**

````
{
  "name": "SOURCE_TARGET",
  "subjects": [
    "foo1.ext.*",
    "foo2.ext.*"
  ],
  "discard": "old",
  "duplicate_window": 120000000000,
  "sources": [
    {
      "name": "SOURCE1_ORIGIN",
      "filter_subject": "foo1.bar",
      "opt_start_seq": 42,
      "external": {
        "deliver": "",
        "api": "$JS.domainA.API"
      }
    },
    {
      "name": "SOURCE2_ORIGIN",
      "filter_subject": "foo2.bar"
    }
  ],
  "consumer_limits": {
    
  },
  "deny_delete": false,
  "sealed": false,
  "max_msg_size": -1,
  "allow_rollup_hdrs": false,
  "max_bytes": -1,
  "storage": "file",
  "allow_direct": false,
  "max_age": 0,
  "max_consumers": -1,
  "max_msgs_per_subject": -1,
  "num_replicas": 1,
  "name": "SOURCE_TARGET",
  "deny_purge": false,
  "compression": "none",
  "max_msgs": -1,
  "retention": "limits",
  "mirror_direct": false
}
````

## Пример конфигурации потока с mirror


**Минимальный пример**

````
{
  "name": "MIRROR_TARGET"
  "discard": "old",
  "mirror": {
    "name": "MIRROR_ORIGIN"
  },
  "deny_delete": false,
  "sealed": false,
  "max_msg_size": -1,
  "allow_rollup_hdrs": false,
  "max_bytes": -1,
  "storage": "file",
  "allow_direct": false,
  "max_age": 0,
  "max_consumers": -1,
  "max_msgs_per_subject": -1,
  "num_replicas": 1,
  "name": "MIRROR_TARGET",
  "deny_purge": false,
  "compression": "none",
  "max_msgs": -1,
  "retention": "limits",
  "mirror_direct": false
}
````


**С дополнительными опциями**

````
{
  "name": "MIRROR_TARGET"
  "discard": "old",
  "mirror": {
    "opt_start_time": "2024-07-11T08:57:20.4441646Z",
    "external": {
      "deliver": "",
      "api": "$JS.domainB.API"
    },
    "name": "MIRROR_ORIGIN"
  },
  "consumer_limits": {
    
  },
  "deny_delete": false,
  "sealed": false,
  "max_msg_size": -1,
  "allow_rollup_hdrs": false,
  "max_bytes": -1,
  "storage": "file",
  "allow_direct": false,
  "max_age": 0,
  "max_consumers": -1,
  "max_msgs_per_subject": -1,
  "num_replicas": 1,
  "name": "MIRROR_TARGET",
  "deny_purge": false,
  "compression": "none",
  "max_msgs": -1,
  "retention": "limits",
  "mirror_direct": false
}
````
