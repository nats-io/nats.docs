# SQL Store

Using a SQL Database for persistence is another option.

In order to do so, `-store` simply needs to be set to `sql` and `-sql_driver` set to `mysql` or `postgres` \(the two drivers supported at the moment\). The parameter `-sql_source` is driver specific, but generally contains the information required to connect to a specific database on the given SQL database server. You can find the connect options in the respective driver repositories: [MySQL](https://github.com/go-sql-driver/mysql#dsn-data-source-name) and [Postgres](https://pkg.go.dev/github.com/lib/pq#hdr-Connection_String_Parameters).

Note that the NATS Streaming Server does not need root privileges to connect to the database since it does not create the database, tables or indexes. This has to be done by the Database Administrator.

We provide 2 files \(`scripts/mysql.db.sql` and `scripts/postgres.db.sql`\) that can be used to create the tables and indexes to the database of your choice. However, administrators are free to configure and optimize the database as long as the name of tables and columns are preserved, since the NATS Streaming Server is going to issue SQL statements based on those.

Here is an example of creating an user `nss` with password `password` for the MySQL database:

```shell
mysql -u root -e "CREATE USER 'nss'@'localhost' IDENTIFIED BY 'password'; GRANT ALL PRIVILEGES ON *.* TO 'nss'@'localhost'; CREATE DATABASE nss_db;"
```

The above gives all permissions to user `nss`. Once this user is created, we can then create the tables using this user and selecting the `nss_db` database. We then execute all the SQL statements creating the tables from the sql file that is provided in this repo:

```shell
mysql -u nss -p -D nss_db -e "$(cat ./scripts/mysql.db.sql)"
```

## Example - Postgres

Run a local dockerized instance of postgres if you do not already have one:

```shell
ID=$(docker run -d -e POSTGRES_PASSWORD=password -p 5432:5432 postgres)
```

\[Optional\] Drop any previous tables to clear data from previous sessions:

```shell
cat scripts/drop_postgres.db.sql | docker exec -i $ID psql -h 127.0.1.1 -U postgres
```

Run the appropriate database migrations for Postgres:

```shell
cat scripts/postgres.db.sql | docker exec -i $ID psql -h 127.0.1.1 -U postgres
```

Capture the hostname/IP of Postgres:

```shell
export DOCKER_BRIDGE_IP=$(docker inspect --format '{{(index .IPAM.Config 0).Gateway}}' bridge)
```

Run the nats streaming server with postgres at the `sql_source`:

```shell
docker run -d --name nats-streaming -p 4222:4222 -p 8222:8222 nats-streaming -m 8222 --store sql --sql_driver postgres --sql_source="user=postgres password=password host=$DOCKER_BRIDGE_IP port=5432 sslmode=disable"
```

Note that if you want to enable debug and tracing you can pass the `-SDV` option to the command line. You may not want to leave this setting on in production because it can be too verbose and affect performance.

```shell
docker run -d (..) nats-streaming -SDV -m 8222 --store ...
```

## Read and Write Timeouts

Sometimes, it is possible that a DB connection between the streaming server and the DB server is stale but the connection is not dropped. This would cause the server to block while trying to store or lookup a message, or any other operation involving the database. Because of internal locking in the store implementation, this could cause the server to seemingly be unresponsive.

To mitigate that, you can pass `readTimeout` and `writeTimeout` options to the `sql_source` when starting the server. The MySQL driver had always had those options, but we have extended the Postgres driver that we use to provide those options in NATS Streaming `v0.16.0`. You pass the values as a duration, for instance `5s` for 5 seconds.

Here is what a `sql_source` would look like for `MySQL` driver:

```shell
nats-streaming-server -store sql -sql_driver mysql -sql_source "nss:password@/nss_db?readTimeout=5s&writeTimeout=5s" ..
```

Or, for `Postgres` driver:

```shell
nats-streaming-server -store sql -sql_driver postgres -sql_source "dbname=nss_db readTimeout=5s writeTimeout=5s sslmode=disable" ..
```

Be careful to not make those values too small otherwise you could cause unwanted failures.

## Options

Aside from the driver and datasource, the available options are the maximum number of opened connections to the database \(`max_open_conns`\) that you may need to set to avoid errors due to `too many opened files`.

The other option is `no_caching` which is a boolean that enables/disables caching. By default caching is enabled. It means that some operations are buffered in memory before being sent to the database. For storing messages, this still offers the guarantee that if a producer gets an OK ack back, the message will be successfully persisted in the database.

For subscriptions, the optimization may lead to messages possibly redelivered if the server were to be restarted before some of the operations were "flushed" to the database. The performance improvement is significant to justify the risk of getting redelivered messages \(which is always possible with NATS Streaming regardless of this option\). Still, if you want to ensure that each operation is immediately committed to the database, you should set `no_caching` to true.

