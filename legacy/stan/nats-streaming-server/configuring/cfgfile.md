# Configuration File

You can use a configuration file to configure the options specific to the NATS Streaming Server.

Use the `-sc` or `--stan_config` command line parameter to specify the file to use.

For the embedded NATS Server, you can use another configuration file and pass it to the Streaming Server using `-c` or `--config` command line parameters.

Since most options do not overlap, it is possible to combine all options into a single file and specify this file using either the `-sc` or `-c` command line parameter.

However, the option named `tls` is common to NATS Server and NATS Streaming Server. If you plan to use a single configuration file and configure TLS, you should have all the streaming configuration included in a `streaming` map. This is actually a good practice regardless if you use TLS or not, to protect against possible addition of new options in NATS Server that would conflict with the names of NATS Streaming options.

For instance, you could use a single configuration file with such content:

```text
# Some NATS Server TLS Configuration
listen: localhost:5222
tls: {
    cert_file: "/path/to/server/cert_file"
    key_file: "/path/to/server/key_file"
    verify: true
    timeout: 2
}

# NATS Streaming Configuration
streaming: {
    cluster_id: my_cluster

    tls: {
        client_cert: "/path/to/client/cert_file"
        client_key: "/path/to/client/key_file"
    }
}
```

However, if you want to avoid any possible conflict, simply use two different configuration files.

Note the order in which options are applied during the start of a NATS Streaming server:

1. Start with some reasonable default options.
2. If a configuration file is specified, override those options

   with all options defined in the file. This includes options that are defined

   but have no value specified. In this case, the zero value for the type of the

   option will be used.

3. Any command line parameter override all of the previous set options.

In general the configuration parameters are the same as the command line arguments. Below is the list of NATS Streaming parameters:

Note: You may need to scroll horizontally to see all columns.

| Parameter | Meaning | Possible Values | Usage Example | Default Value | Since |
| :--- | :--- | :--- | :--- | :--- | :--- |
| cluster_id | Cluster name | String, underscore possible | `cluster_id: "my_cluster_name"` | `test-cluster` | All |
| discover_prefix | Subject prefix for server discovery by clients | NATS Subject | `discover_prefix: "_STAN.Discovery"` | `_STAN.discover` | All |
| store | Store type | `memory`, `file` or `sql` | `store: "file"` | `memory` | All |
| dir | When using a file store, this is the root directory | File path | `dir: "/path/to/storage` | N/A | All |
| sd | Enable debug logging | `true` or `false` | `sd: true` | `false` | All |
| sv | Enable trace logging | `true` or `false` | `sv: true` | `false` | All |
| nats_server_url | If specified, connects to an external NATS Server, otherwise starts an embedded one | NATS URL | `nats_server_url: "nats://localhost:4222"` | N/A | All |
| secure | If true, creates a TLS connection to the server but without the need to use TLS configuration \(no NATS Server certificate verification\) | `true` or `false` | `secure: true` | `false` | All |
| tls | TLS Configuration | Map: `tls: { ... }` | [**See details below**](cfgfile.md#tls-configuration) |  | All |
| store_limits | Store Limits | Map: `store_limits: { ... }` | [**See details below**](cfgfile.md#store-limits-configuration) |  | All |
| file_options | File Store specific options | Map: `file_options: { ... }` | [**See details below**](cfgfile.md#file-options-configuration) |  | All |
| hb_interval | Interval at which the server sends an heartbeat to a client | Duration | `hb_interval: "10s"` | `30s` | v0.3.6 |
| hb_timeout | How long the server waits for a heartbeat response from the client before considering it a failed heartbeat | Duration | `hb_timeout: "10s"` | `10s` | v0.3.6 |
| hb_fail_count | Count of failed heartbeats before server closes the client connection. The actual total wait is: \(fail count + 1\) \* \(hb interval + hb timeout\) | Number | `hb_fail_count: 2` | `10` | v0.3.6 |
| ft_group | In Fault Tolerance mode, you can start a group of streaming servers with only one server being active while others are running in standby mode. This is the name of this FT group | String | `ft_group: "my_ft_group"` | N/A | v0.4.0 |
| partitioning | If set to true, a list of channels must be defined in store_limits/channels section. This section then serves two purposes, overriding limits for a given channel or adding it to the partition | `true` or `false` | `partitioning: true` | `false` | v0.5.0 |
| sql_options | SQL Store specific options | Map: `sql_options: { ... }` | [**See details below**](cfgfile.md#sql-options-configuration) |  | v0.7.0 |
| cluster | Cluster Configuration | Map: `cluster: { ... }` | [**See details below**](cfgfile.md#cluster-configuration) |  | v0.9.0 |
| syslog_name | On Windows, when running several servers as a service, use this name for the event source | String |  | v0.11.0 |  |
| encrypt | Specify if server should encrypt messages \(only the payload\) when storing them | `true` or `false` | `encrypt: true` | `false` | v0.12.0 |
| encryption_cipher | Cipher to use for encryption. Currently support AES and CHAHA \(ChaChaPoly\). Defaults to AES | `AES` or `CHACHA` | `encryption_cipher: "AES"` | Depends on platform | v0.12.0 |
| encryption_key | Encryption key. It is recommended to specify the key through the `NATS_STREAMING_ENCRYPTION_KEY` environment variable instead | String | `encryption_key: "mykey"` | N/A | v0.12.0 |
| credentials | Credentials file to connect to external NATS 2.0+ Server | String | `credentials: "streaming_server.creds"` | N/A | v0.16.2 |
| username | Username is used to connect to a NATS Server when authentication with multiple users is enabled | String | `username: "streaming_server"` | N/A | v0.19.0 |
| password | Password used with above `username` | String | `password: "password"` | N/A | v0.19.0 |
| token | Authentication token if the NATS Server requires a token | String | `token: "some_token"` | N/A | v0.19.0 |
| nkey_seed_file | Path to an NKey seed file \(1\) if NKey authentication is used | File Path | `nkey_seed_file: "/path/to/some/seedfile"` | N/A | v0.19.0 |
| replace_durable | Replace the existing durable subscription instead of reporting a duplicate durable error | `true` or `false` | `replace_durable: true` | `false` | v0.20.0 |

Notes:

\(1\) The seed file contains the NKey seed from which the Streaming server can extract the public key and the private key used to sign the nonce sent by the NATS Server when accepting connections from the Streaming server. The file is read during the connection process, the key is used to sign but then wiped from memory. The file must contain the seed file with the following format:

```text
-----BEGIN USER NKEY SEED-----
SU<rest of the seed>
------END USER NKEY SEED------
```

## TLS Configuration

Note that the Streaming Server uses a connection to a NATS Server, and so the NATS Streaming TLS Configuration is in fact a client-side TLS configuration.

| Parameter | Meaning | Possible Values | Usage Example | Default Value | Since |
| :--- | :--- | :--- | :--- | :--- | :--- |
| client_cert | Client key for the streaming server | File path | `client_cert: "/path/to/client/cert_file"` | N/A | All |
| client_key | Client certificate for the streaming server | File path | `client_key: "/path/to/client/key_file"` | N/A | All |
| client_ca | Client certificate CA for the streaming server | File path | `client_ca: "/path/to/client/ca_file"` | N/A | All |
| server_name | Expected hostname returned in the NATS Server certificate | String | `server_name: "theserverhostname"` | N/A | v0.17.0 |
| insecure | Skips the NATS server's certificate chain and host name verification. Should not be used in production | `true` or `false` | `insecure: true` | `false` | v0.17.0 |

## Store Limits Configuration

```text
{
    streaming: {
        cluster_id: my_cluster
        store_limits {
            max_msgs: 10000
        }
    }
}
```

| Parameter | Meaning | Possible Values | Usage Example | Default Value | Since |
| :--- | :--- | :--- | :--- | :--- | :--- |
| max_channels | Maximum number of channels, 0 means unlimited | Number &gt;= 0 | `max_channels: 100` | `100` | All |
| max_subs | Maximum number of subscriptions per channel, 0 means unlimited | Number &gt;= 0 | `max_subs: 100` | `1000` | All |
| max_msgs | Maximum number of messages per channel, 0 means unlimited | Number &gt;= 0 | `max_msgs: 10000` | `1000000` | All |
| max_bytes | Total size of messages per channel, 0 means unlimited | Number &gt;= 0 | `max_bytes: 1GB` | 1GB | All |
| max_age | How long messages can stay in the log | Duration | `max_age: "24h"` | Unlimited | All |
| max_inactivity | How long without any subscription and any new message before a channel can be automatically deleted | Duration | `max_inactivity: "24h"` | Unlimited | v0.9.0 |
| channels | A map of channel names with specific limits | Map: `channels: { ... }` | [**See details below**](cfgfile.md#channels) |  | All |

## Channels

The `channels` section is a map with the key being the channel name. For instance:

```text
{
    streaming: {
        cluster_id: my_cluster
        store_limits {
            channels: {
                "foo": {
                    max_msgs: 100
                }
            }
        }
    }
}
```

For a given channel, the possible parameters are:

| Parameter | Meaning | Possible Values | Usage Example | Default Value | Since |
| :--- | :--- | :--- | :--- | :--- | :--- |
| max_subs | Maximum number of subscriptions per channel, 0 means unlimited | Number &gt;= 0 | `max_subs: 100` | Inherit from global settings | All |
| max_msgs | Maximum number of messages per channel, 0 means unlimited | Number &gt;= 0 | `max_msgs: 10000` | Inherit from global settings | All |
| max_bytes | Total size of messages per channel, 0 means unlimited | Bytes | `max_bytes: 1GB` | Inherit from global settings | All |
| max_age | How long messages can stay in the log | Duration | `max_age: "24h"` | Inherit from global settings | All |
| max_inactivity | How long without any subscription and any new message before a channel can be automatically deleted | Duration | `max_inactivity: "24h"` | Inherit from global settings | v0.9.0 |

## File Options Configuration

| Parameter | Meaning | Possible Values | Usage Example | Default Value | Since |
| :--- | :--- | :--- | :--- | :--- | :--- |
| compact | Enable/disable file compaction. Only some of the files \(`clients.dat` and `subs.dat`\) are subject to compaction | `true` or `false` | `compact: true` | `true` | All |
| compact_fragmentation | Compaction threshold \(in percentage\) | Number &gt;= 0 | `compact_fragmentation: 50` | `50` | All |
| compact_interval | Minimum interval between attempts to compact files | Expressed in seconds | `compact_interval: 300` | `300` | All |
| compact_min_size | Minimum size of a file before compaction can be attempted | Bytes | `compact_min_size: 1GB` | `1MB` | All |
| buffer_size | Size of buffers that can be used to buffer write operations | Bytes | `buffer_size: 2MB` | `2MB` | All |
| crc | Define if CRC of records should be computed on reads | `true` or `false` | `crc: true` | `true` | All |
| crc_poly | You can select the CRC polynomial. Note that changing the value after records have been persisted would result in server failing to start complaining about data corruption | Number &gt;= 0 | `crc_poly: 3988292384` | `3988292384` | All |
| sync_on_flush | Define if server should perform "file sync" operations during a flush | `true` or `false` | `sync_on_flush: true` | `true` | All |
| slice_max_msgs | Define the file slice maximum number of messages. If set to 0 and a channel count limit is set, then the server will set a slice count limit automatically | Number &gt;= 0 | `slice_max_msgs: 10000` | automatic | v0.3.4 |
| slice_max_bytes | Define the file slice maximum size \(including the size of index file\). If set to 0 and a channel size limit is set, then the server will set a slice bytes limit automatically | Bytes | `slice_max_bytes: 64MB` | `64MB` | v0.3.4 |
| slice_max_age | Define the period of time covered by a file slice, starting at when the first message is stored. If set to 0 and a channel age limit is set, then the server will set a slice age limit automatically | Duration | `slice_max_age: "24h"` | automatic | v0.3.4 |
| slice_archive_script | Define the location and name of a script to be invoked when the server discards a file slice due to limits. The script is invoked with the name of the channel, the name of data and index files. It is the responsibility of the script to then remove the unused files | File path | `slice_archive_script: "/home/nats-streaming/archive/script.sh"` | N/A | v0.3.4 |
| file_descriptors_limit | Channels translate to sub-directories under the file store's root directory. Each channel needs several files to maintain the state so the need for file descriptors increase with the number of channels. This option instructs the store to limit the concurrent use of file descriptors. Note that this is a soft limit and there may be cases when the store will use more than this number. A value of 0 means no limit. Setting a limit will probably have a performance impact | Number &gt;= 0 | `file_descriptors_limit: 100` | unlimited | v0.4.0 |
| parallel_recovery | When the server starts, the recovery of channels \(directories\) is done sequentially. However, when using SSDs, it may be worth setting this value to something higher than 1 to perform channels recovery in parallel | Number &gt;= 1 | `parallel_recovery: 4` | `1` | v0.5.0 |
| read_buffer_size | Size of buffers used to read ahead from message stores. This can significantly speed up sending messages to consumers after messages have been published. Default is 2MB. Set to 0 to disable | Bytes | `read_buffer_size: 2MB` | `2MB` | v0.16.0 |
| auto_sync | Interval at which the store should be automatically flushed and sync'ed on disk. Default is every minute. Set to &lt;=0 to disable | Duration | `auto_sync: "2m"` | `1m` | v0.16.0 |

## Cluster Configuration

| Parameter | Meaning | Possible Values | Usage Example | Default Value | Since |
| :--- | :--- | :--- | :--- | :--- | :--- |
| node_id | ID of the node within the cluster if there is no stored ID | String \(no whitespace\) | `node_id: "node-a"` | N/A | v0.9.0 |
| bootstrap | Bootstrap the cluster if there is no existing state by electing self as leader | `true` or `false` | `bootstrap: true` | `false` | v0.9.0 |
| peers | List of cluster peer node IDs to bootstrap cluster state | List of node IDs | `peers: ["node-b", "node-c"]` | N/A | v0.9.0 |
| log_path | Directory to store log replication data | File path | `log_path: "/path/to/storage"` | N/A | v0.9.0 |
| log_cache_size | Number of log entries to cache in memory to reduce disk IO | Number &gt;= 0 | `log_cache_size: 1024` | `512` | v0.9.0 |
| log_snapshots | Number of log snapshots to retain | Number &gt;= 0 | `log_snapshots: 1` | `2` | v0.9.0 |
| trailing_logs | Number of log entries to leave after a snapshot and compaction | Number &gt;= 0 | `trailing_logs: 256` | `10240` | v0.9.0 |
| sync | Do a file sync after every write to the replication log and message store | `true` or `false` | `sync: true` | `false` | v0.9.0 |
| raft_logging | Enable logging from the Raft library \(disabled by default\) | `true` or `false` | `raft_logging: true` | `false` | v0.9.0 |
| raft_heartbeat_timeout | Specifies the time in follower state without a leader before attempting an election | Duration | `raft_heartbeat_timeout: "2s"` | `2s` | v0.11.2 |
| raft_election_timeout | Specifies the time in candidate state without a leader before attempting an election | Duration | `raft_election_timeout: "2s"` | `2s` | v0.11.2 |
| raft_lease_timeout | Specifies how long a leader waits without being able to contact a quorum of nodes before stepping down as leader | Duration | `raft_lease_timeout: "1s"` | `1s` | v0.11.2 |
| raft_commit_timeout | Specifies the time without an Apply\(\) operation before sending an heartbeat to ensure timely commit. Due to random staggering, may be delayed as much as 2x this value | Duration | `raft_commit_timeout: "100ms"` | `100ms` | v0.11.2 |
| proceed_on_restore_failure | Allow a non leader node to proceed with restore failures, do not use unless you understand the risks! | `true` or `false` | `proceed_on_restore_failure: true` | `false` | v0.17.0 |
| allow_add_remove_node | Enable the ability to send NATS requests to the leader to add/remove cluster nodes | `true` or `false` | `allow_add_remove_node: true` | `false` | v0.19.0 |
| bolt_free_list_sync | Causes the RAFT log to synchronize the free list on write operations. Reduces performance at runtime, but makes the recovery faster | `true` or `false` | `bolt_free_list_sync: true` | `false` | v0.21.0 |
| bolt_free_list_map | Sets the backend freelist type to use a map instead of the default array type. Improves performance for large RAFT logs, with fragmented free list | `true` or `false` | `bolt_free_list_map: true` | `false` | v0.21.0 |
| nodes_connections | Enable creation of dedicated NATS connections to communicate with other nodes | `true` or `false` | `nodes_connections: true` | `false` | v0.21.0 |

## SQL Options Configuration

| Parameter | Meaning | Possible Values | Usage Example | Default Value | Since |
| :--- | :--- | :--- | :--- | :--- | :--- |
| driver | Name of the SQL driver to use | `mysql` or `postgres` | `driver: "mysql"` | N/A | v0.7.0 |
| source | How to connect to the database. This is driver specific | String | `source: "ivan:pwd@/nss_db"` | N/A | v0.7.0 |
| no_caching | Enable/Disable caching for messages and subscriptions operations. | `true` or `false` | `no_caching: false` | `false` \(caching enabled\) | v0.7.0 |
| max_open_conns | Maximum number of opened connections to the database. Value &lt;= 0 means no limit. | Number | `max_open_conns: 5` | unlimited | v0.7.0 |
| bulk_insert_limit | Maximum number of messages stored with a single SQL "INSERT" statement. The default behavior is to send individual insert commands as part of a SQL transaction. | Number | `bulk_insert_limit: 1000` | `0` \(not enabled\) | v0.20.0 |

