# Message Log

You can view a message log as a First In First Out (FIFO) queue. Messages are appended to the end of the log. If a limit is set globally for all channels, or specifically for this channel, when the limit is reached, older messages are removed to make room for the new ones.

But except for the administrative size/age limit set for a message log, messages are not removed due to consumers consuming them. In fact, messages are stored regardless of the presence of subscriptions on that channel.
