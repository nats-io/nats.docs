# Creating a systemd NATS Server and JetStream Daemon that Persists through Restarts

## Pre-conditions

NATS Server and NATS CLI is intalled at your home directory under `.../.local/bin/`

## Goal

To have a working NATS JetStream Server running as a `systemd` service (unit) file. 
This will allow you to manage your NATS Server using `systemctl`.

## Concepts and Patterns

`systemd` is a system daemon that runs on most Linux distros by default. It allows for application binaries to automatically start upon boot of a Linux machine, restart automatically upon crashes or failures, as well as unify logging for various services running on the OS as daemons (processes that run constantly, in the OS).
This is useful in cases where we need a NATS server to persist through a restart because we need our JetStream to be available to any consumers at all times (or close to it).

## Step by Step Example

1. Below is our Service file, let's call it `nats-jetstream-queue.service`:
```
[Unit]
Description=NATS JetStream Persistent Queue Service
After=multi-user.target

[Service]
Type=simple
WorkingDirectory=/home/example-user

# needed for correct permissions
User=example-user

# run the jetstream config file from the hardcoded directory
ExecStart=/home/example-user/.local/bin/nats-server -c /home/example-user/jetstream.conf

# Service should restart on pretty much anything except SIGINT/CTRL+C/systemctl stop
Restart=on-failure

# Allow some time between restart
RestartSec=2

[Install]
# system wide service
WantedBy=multi-user.target
```

2. Copy this file into `/etc/systemd/system`.

3. For example's sake, here is the sample `jetstream.conf` referenced above:
```
jetstream {
   store_dir=nats_data
}
```
All it does is specify a folder where NATS should store data (jetstream data will be stored here as a subfolder).

4. Create this file at the following directory: `/home/example-user/jetstream.conf`

5. Run `sudo systemctl enable nats-jetstream-queue.service && sudo systemctl start nats-jetstream-queue.service`. Enabling the service will cause it to automatically start on boot, and starting the service will run the service without needing to reboot. 

6. Run `sudo systemctl status nats-jetstream-queue.service` and see if everything looks good/if the logs show any errors 


