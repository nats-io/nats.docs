# connect_retries

/ [config](/ref/config/index.md) / [cluster](/ref/config/config/cluster/index.md)

After how many failed connect attempts to give up establishing a connection to a _discovered_ route. Default is 0, do not retry.
When enabled, attempts will be made once a second. This, does not apply to explicitly configured routes.

_Default value_: `0`
