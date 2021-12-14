# Subject-Based Messaging

Fundamentally, NATS is about publishing and listening for messages. Both of these depend heavily on _Subjects_.
  
**What is a Subject?**  
At its simplest, a subject is just a string of characters that form a name which the publisher and subscriber can use to find each other. It helps scope messages into streams or topics.   

![](../.gitbook/assets/subjects1.svg)
  
### Characters allowed for subject names

For compatibility across clients, we recommend using ASCII characters (this may change in future).  
  
**Recommended characters:** `a` to `z`, `A` to `Z`, `0` to `9`,  (names are case sensitive and cannot contain whitespace).  
**Special characters:** The period `.` (which is used to separate the tokens in the subject) and `*` plus `>` (which are used as wildcards).
  
## Subject Hierarchies

The `.` character is used to create a subject hierarchy. For example, a world clock application might define the following to logically group related subjects:

```markup
time.us
time.us.east
time.us.east.atlanta
time.eu.east
time.eu.warsaw
```

## Wildcards

NATS provides two _wildcards_ that can take the place of one or more elements in a dot-separated subject. Subscribers can use these wildcards to listen to multiple subjects with a single subscription but Publishers will always use a fully specified subject, without the wildcard.

### Matching A Single Token

The first wildcard is `*` which will match a single token. For example, if an application wanted to listen for eastern time zones, they could subscribe to `time.*.east`, which would match `time.us.east` and `time.eu.east`.

![](../.gitbook/assets/subjects2.svg)

### Matching Multiple Tokens

The second wildcard is `>` which will match one or more tokens, and can only appear at the end of the subject. For example, `time.us.>` will match `time.us.east` and `time.us.east.atlanta`, while `time.us.*` would only match `time.us.east` since it can't match more than one token.

![](../.gitbook/assets/subjects3.svg)

### Monitoring and Wire Taps

Subject to your security configuration, wildcards can be used for monitoring by creating something sometimes called a _wire tap_. In the simplest case you can create a subscriber for `>`. This application will receive all messages -- again, subject to security settings -- sent on your NATS cluster.

### Mix Wildcards

The wildcard `*` can appear multiple times in the same subject. Both types can be used as well. For example, `*.*.east.>` will receive `time.us.east.atlanta`.

## Subject Tokens

It is recommended to keep the maximum number of tokens in your subjects to a reasonable value of 16 tokens max.

