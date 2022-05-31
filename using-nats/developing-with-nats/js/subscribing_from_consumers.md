# Subscribing from Consumers

To receive messages from streams you don't subscribe directly to the streams but subscribe to consumers defined on the stream.

Consumers are a 'view' on a stream that can filter on subject names and are stateful. The state, such as stream sequence numbers for position and acknowledgements, is persisted by the servers.

There are two kinds of consumers according to their life-cycle.

## Ephemeral consumers

Ephemeral consumers are created and deleted automatically by JetStream, and are meant to be used by a single instance of an application requesting its own (potentially filtered) copy of the messages stored in the stream.

{% tabs %}
{% tab title="Go" %}

{% endtab %}
{% tab title="Java" %}

{% endtab %}
{% tab title="JavaScript" %}

{% endtab %}
{% tab title="Python" %}

{% endtab %}
{% tab title="C" %}

{% endtab %}
{% endtabs %}

## Durable consumers

Durables consumers are created and deleted explicitly. They are meant to be used by multiple applications at the same time, the messages being distributed between the subscribers, in which case they are typically defined administratively outside of the application code, or by a single application wanting to persist its position in the stream between application restarts.

Defining a consumer is an idempotent operation: if the consumer already exists no error is returned and the current consumer info is returned (no change in consumer state).

{% tabs %}
{% tab title="Go" %}

{% endtab %}
{% tab title="Java" %}

{% endtab %}
{% tab title="JavaScript" %}

{% endtab %}
{% tab title="Python" %}

{% endtab %}
{% tab title="C" %}

{% endtab %}
{% endtabs %}