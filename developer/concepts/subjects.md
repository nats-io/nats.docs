# Subject-based Messaging

Fundamentally NATS is about publishing and listening for messages. Both of these depend heavily on _Subjects_ which scope messages into streams or topics. At its simplest, a subject is just a string of characters that form a name the publisher and subscriber can used to find each other.

<div class="graphviz"><code data-viz="dot">
digraph g {
  rankdir=LR
  publisher [shape=box, style="rounded", label="PUB time.us"];
  subject [shape=circle, label="gnatsd"];
  sub1 [shape=box, style="rounded", label="SUB time.us"];
  sub2 [shape=box, style="rounded", label="SUB time.us"];

  publisher -> subject [label="msg"];
  subject -> sub1 [label="msg"];
  subject -> sub2 [label="msg"];
}
</code></div>

 The NATS server reserves a few characters as special, and the specification says that only "alpha-numeric" characters plus the "." should be used in subject names. Subjects are case-sensitive and can not contain whitespace. For safety across clients, ASCII characters should be used, although this is subject to change in the future.

## Subject Hierarchies

The `.` character is used to create a subject hierarchy. For example, a world clock application might define the following to logically group related subjects:

```markup
time.us
time.us.east
time.us.east.atlanta
time.eu.east
time.us.east.warsaw
```

to logically group related subjects.

## Wildcards

NATS provides two _wildcards_ that can take the place of one or more elements in a dot-separated subject. Subscribers can use these wildcards to listen to multiple subjects with a single subscription but Publishers will always use a fully specified subject, without the wildcard.

### Matching A Single Token

The first wildcard is `*` which will match a single token. For example, if an application wanted to listen for eastern time zones, they could subscribe to `time.*.east`, which would match `time.us.east` and `time.eu.east`.

<div class="graphviz"><code data-viz="dot">
digraph g {
  rankdir=LR
  publisher [shape=box, style="rounded", label="PUB time.us.east"];
  subject [shape=circle, label="gnatsd"];
  sub1 [shape=box, style="rounded", label="SUB time.*.east"];
  sub2 [shape=box, style="rounded", label="SUB time.us.east"];

  publisher -> subject [label="msg"];
  subject -> sub1 [label="msg"];
  subject -> sub2 [label="msg"];
}
</code></div>

### Matching Multiple Tokens

The second wildcard is `>` which will match one or more tokens, and can only appear at the end of the subject. For example, `time.us.>` will match `time.us.east` and `time.us.east.atlanta`, while `time.us.*` would only match `time.us.east` since it can't match more than one token.

<div class="graphviz"><code data-viz="dot">
digraph g {
  rankdir=LR
  publisher [shape=box, style="rounded", label="PUB time.us.east.atlanta"];
  subject [shape=circle, label="gnatsd"];
  sub1 [shape=box, style="rounded", label="SUB time.us.east.atlanta"];
  sub2 [shape=box, style="rounded", label="SUB time.us.*"];
  sub3 [shape=box, style="rounded", label="SUB time.us.>"];

  publisher -> subject [label="msg"];
  subject -> sub2 [style="invis"];
  subject -> sub1 [label="msg"];
  subject -> sub3 [label="msg"];
}
</code></div>
