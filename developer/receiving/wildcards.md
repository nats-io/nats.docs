# Wildcards

There is no special code to subscribe with a wildcard subject. The main technique that may come in to play is to use the subject provided with the incoming message to determine what to do with the message.

For example, you can subscribe using `*` and then act based on the actual subject.

!INCLUDE "../../_examples/subscribe_star.html"

or do something similar with `>`:

!INCLUDE "../../_examples/subscribe_arrow.html"

The following example can be used to test these two subscribers. The `*` subscriber should receive at most 2 messages, while the `>` subscriber receives 4. More importantly the `time.*.east` subscriber won't receive on `time.us.east.atlanta` because that won't match.

!INCLUDE "../../_examples/wildcard_tester.html"