# connect_retries

/ [Server Config](/ref/config/index.md) / [cluster](/ref/config/cluster/index.md) 

After how many failed connect attempts to give up establishing a connection to a *discovered* route. Default is 0, do not retry.
When enabled, attempts will be made once a second. This, does not apply to explicitly configured routes.

*Default value*: `0`

*Reloadable*: `true`

*Types*

- `integer`


