# Ping/Pong Protocol

The client and server use a simple PING/PONG protocol to check that they are both still connected. The client will ping the server on a regular, configured interval so that the server usually doesn't have to initiate the PING/PONG interaction.

<div class="graphviz"><code data-viz="dot">
digraph g {
  rankdir=LR
  client [shape=box, style="rounded", label="NATS Client"];
  natsserver [shape=circle, fixedsize="true", width="1.0", height="1.0", label="nats-server"];

  client -> natsserver [label="PING"];
  natsserver -> client [label="PONG"];
}
</code></div>

## Set the Ping Interval

If you have a connection that is going to be open a long time with few messages traveling on it, setting this PING interval can control how quickly the client will be notified of a problem. However on connections with a lot of traffic, the client will often figure out there is a problem between PINGS, and as a result the default PING interval is often on the order of minutes. To set the interval to 20s:

!INCLUDE "../../_examples/ping_20s.html"

## Limit Outgoing Pings

The PING/PONG interaction is also used by most of the clients as a way to flush the connection to the server. Clients that cache outgoing messages provide a flush call that will run a PING/PONG. The flush will wait for the PONG to return, telling it that all cached messages have been processed, including the PING. The number of cached PING requests can be limited in most clients to insure that traffic problems are identified early. This configuration for _max outgoing pings_ or similar will usually default to a small number and should only be increased if you are worried about fast flush traffic, perhaps in multiple threads.

For example, to set the maximum number of outgoing pings to 5:

!INCLUDE "../../_examples/ping_5.html"
