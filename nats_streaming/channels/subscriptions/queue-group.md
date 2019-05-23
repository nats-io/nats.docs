# Queue Group

When consumers want to consume from the same channel but each receive a different message, as opposed to all receiving the same messages, they need to create a queue subscription. When a queue group name is specified, the server will send each messages from the log to a single consumer in the group. The distribution of these messages is not specified, therefore applications should not rely on an expected delivery scheme.

After the first queue member is created, any other member joining the group will receive messages based on where the server is in the message log for that particular group. That means that starting position given by joining members is ignored by the server.

When the last member of the group leaves (subscription unsubscribed/closed/or connection closed), the group is removed from the server. The next application creating a subscription with the same name will create a new group, starting at the start position given in the subscription request.

A queue subscription can also be durable. For that, the client needs to provide a queue and durable name. The behavior is, as you would expect, a combination of queue and durable subscription. Unlike a durable subscription, though, the client ID is not part of the queue group name. It makes sense, because since client ID must be unique, it would prevent more than one connection to participate in the queue group. The main difference between a queue subscription and a durable one, is that when the last member leaves the group, the state of the group will be maintained by the server. Later, when a member rejoins the group, the delivery will resume.

***Note: For a durable queue subscription, the last member to * unsubscribe * (not simply close) causes the group to  be removed from the server.***
