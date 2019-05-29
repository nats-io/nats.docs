# Containers

When running the docker image of NATS Streaming Server, you will want to specify a mounted volume so that the data can be recovered. Your `-dir` parameter then points to a directory inside that mounted volume. However, after a restart you may get a failure with a message similar to this:
```
[FTL] STREAM: Failed to start: streaming state was recovered but cluster log path "mycluster/a" is empty
```
This is because the server recovered the streaming state (as pointed by `-dir` and located in the mounted volume), but did not recover the RAFT specific state that is by default stored in a directory named after your cluster id, relative to the current directory starting the executable. In the context of a container, this data will be lost after the container is stopped.

In order to avoid this issue, you need to specify the `-cluster_log_path` and ensure that it points to the mounted volume so that the RAFT state can be recovered along with the Streaming state.
