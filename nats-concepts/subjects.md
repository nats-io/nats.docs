# Subject-Based Messaging

NATS is system for about publishing and listening for messages on named communication channels we call `Subjects`. Fundamentally, NATS is an `interest based` messaging system, where the listener has to `subscribes` to a subset of `subjects`. 

In other middleware systems subjects may be called `topics`, `channels`, `streams` (Note that in NATS the term `stream` in used for a [Jetstream](jetstream/readme.md) message storage). 
  
**What is a Subject?**  
At its simplest, a subject is just a string of characters that form a name that the publisher and subscriber can use to find each other. More commonly [subject hierarchies](#subject-hierarchies) are used to scope messages into semantic name-spaces.  

{% hint style="info" %}
Please check the [constraint and conventions](#characters-allowed-and-recommended-for-subject-names) on naming for subjects here.
{% endhint %}

**Location transparancy**
Through subject based addressing NATS provide location transparency across a (large) cloud of routed NATS servers.
* Subject subscriptions are automatically propagated within the server cloud.
* Messages will be automatically routed to all interested subscribers, independent of location.
* Messages with no subscribers to their subject are automatically discarded (Please see the [Jetstream](jetstream/readme.md) feature for messages persistency). 

![](../.gitbook/assets/subjects1.svg)
  
## Wildcards

NATS provides two _wildcards_ that can take the place of one or more elements in a dot-separated subject.  Publishers will always send a message to a fully specified subject, without the wildcard. While, subscribers can use these wildcards to listen to multiple subjects with a single subscription.

  
## Subject Hierarchies

The `.` character is used to create a subject hierarchy. For example, a world clock application might define the following to logically group related subjects:

```markup
time.us
time.us.east
time.us.east.atlanta
time.eu.east
time.eu.warsaw
```

## Subject usage best practices

There is no hard limit to subject size, but it is recommended to keep the maximum number of tokens in your subjects to a reasonable value. E.g. a maximum of 16 tokens and the subject length to less then 256 characters.

### Number of subjects
NATS can manage a 10s of millions of subjects efficiently, therefore, feel free to use find grained addressing for your business entities. Subjects are an ephemeral resources, which will disappear when no longer subscribed to.

Still, subject subscriptions need to be cached by the server in memory. Keep in consideration that When increasing your subscribed subject count to more than one million you will need more than 1GB of server memory and it will grow linearly from here.

### Subject based filtering and security
The message subject can be filtered why various means and through various configuration element in your NATS server cloud. For example, but not limited to:
* Security - allow/deny per user
* Import/export between accounts 
* Automatic transformations
* When inserting messages into Jetstream streams
* When sourcing/mirroring Jetstream streams
* When connecting leaf nodes (NATS edge servers)
* ...

A well designed subject hierarchy will make the job a lot easier for those tasks. 

### Naming things
{% hint style="info" %}
There are only two hard problems in computer science: Cache invalidation, naming things, and off-by-one errors. -- Unknown author
{% endhint %}

A subject hierarchy is a powerful tool for addressing your application resources. Most NATS users therefore encode business semantics into the subject name. You are free to choose a structure fit for your purpose, but pleas refrain from over-complicating your subject design at the start of the project.

**Some guidelines:**
* Use the first token(s) to establish a general name-space. 
````shell
factory1.tools.group42.unit17
````
* Use the final token(s)for identifiers
````shell
service.deploy.server-acme.app123
````
* A subject *should* be used for more than one message. 
* Subscriptions *should* be stable (exist for receiving more than one message.
* Use wildcard subscriptions over subscribing to individual subjects whenever feasible.
* Name business or physical entities. Refrain from encoding too much data into the subject.
* Encode (business) intent into the subject, not technical details

Pragmatic:
````shell
orders.online.store123.order171711
````
Maybe not so useful:
````shell
orders.online.us.server42.ccpayment.premium.store123.electronics.deliver-dhl.order171711.create
````
* NATS messages  support headers. These can be used for additional metadata. There are subscription modes, which deliver headers only, allowing for effcient scanning of metadata in message flow.



### Matching A Single Token

The first wildcard is `*` which will match a single token. For example, if an application wanted to listen for eastern time zones, they could subscribe to `time.*.east`, which would match `time.us.east` and `time.eu.east`. 
Note that `*` can not match a substring within a token `time.New*.east` will 

![](../.gitbook/assets/subjects2.svg)

### Matching Multiple Tokens

The second wildcard is `>` which will match one or more tokens, and can only appear at the end of the subject. For example, `time.us.>` will match `time.us.east` and `time.us.east.atlanta`, while `time.us.*` would only match `time.us.east` since it can't match more than one token.

![](../.gitbook/assets/subjects3.svg)

### Monitoring and Wire Taps

Subject to your security configuration, wildcards can be used for monitoring by creating something sometimes called a _wire tap_. In the simplest case you can create a subscriber for `>`. This application will receive all messages -- again, subject to security settings -- sent on your NATS cluster.

### Mixing Wildcards

The wildcard `*` can appear multiple times in the same subject. Both types can be used as well. For example, `*.*.east.>` will receive `time.us.east.atlanta`.


## Characters allowed and recommended for subject names

For compatibility across clients and ease of maintaining configuration files, we recommend using Alphanumeric characters and `-` (dash) ASCII characters for all names created by the user. 

Non-ASCII UNICODE characters are deprecated. UTF-8 was supported tentatively but has been deprecated. Multilingual technical names create many issues for editing, configuration files, display, and cross-border collaboration. 

The rules and recommendations here apply to ALL system names, subjects, streams, durables, buckets, keys (in key value stores), as NATS will create API subjects that contain those names. NATS will enforce these constraints in most cases, but we recommend not relying on this.

**Allowed characters** Any ASCII character except `null` and  `.`,`*` and `>`
**Recommended characters:** `a` to `z`, `A` to `Z` and `0` to `9` and `-` (names are case sensitive, and cannot contain whitespace). 
**Naming Conventions** If you want to delimit words, use either CamelCase as in `MyServiceOrderCreate` or `-` as in `my-service-order-create`
**Special characters:** The period `.` (which is used to separate the tokens in the subject) and `*` and also `>` (the `*` and `>` are used as wildcards) are strictly reserved and cannot be used.
**Reserved names:** By convention subject names starting with a `$` are reserved for system use (e.g. subject names starting with `$SYS` or `$JS` or `$KV`, etc...). Many system subjects also use `_` (underscore) (e.g. _INBOX , KV_ABC, OBJ_XYZ etc.)

Good names
```markup
time.us
time.us2.east1
time.new-york
time.SanFrancisco
```

Deprecated subject names
```markup
location.Malmö
$location.Stockholm
_Subjects_.mysubject
```
 
Forbidden stream names
```markup
all*data
<my_stream>
service.stream.1
``` 

### Pedantic mode
By default, for the sake of efficiency, subjects names are not verified during publishing a messages. In particular when generating subjects programmatic-ally this result in illegal subjects which cannot be subscribed to. E.g. subjects containing wildcards may be ignored.

To enable subject name verification activate `pedantic` mode in the client connection options.


```markup
//Java
Options options = Options.builder()
    .server("nats://127.0.0.1:4222")
    .pedantic()
    .build();
Connection nc = Nats.connect(options)    
```






