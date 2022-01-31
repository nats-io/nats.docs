# JetStream contexts
You will need the *JetStream context* to make any JetStream enabled operation. Some client libraries (e.g. Java) also have a *JetStream Management context* (which you will only need if your application needs to create/purge/delete/manage streams and consumers), while some client libraries (e.g. Golang) only have the JetStream context that you use for all operations (including stream management).

You obtain a JetStream context simply from your connection object (and you can optionally specify some JetStream options, most notably the JetStream operation timeout value). You also obtain the JetStream Management context from the connection.

{% tabs %}
{% tab title="Go" %}
```go
// Getting the JetStream context
js, err := nc.JetStream()
if err != nil {
log.Fatalf("Error getting the JetStream context: %v", err)
}
```
{% endtab %}

{% tab title="Java" %}
```java
// Getting the JetStream context
JetStream js = nc.jetStream();
// Getting the JetStream management context
JetStreamManagement jsm = nc.jetStreamManagement();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
```
{% endtab %}

{% tab title="Python" %}
```python
```
{% endtab %}

{% tab title="Ruby" %}
```ruby
```
{% endtab %}

{% tab title="C" %}
```c
```
{% endtab %}
{% endtabs %}