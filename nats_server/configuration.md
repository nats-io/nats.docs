## Configuration File Format

While the NATS server has many flags that allow for simple testing of features, the NATS server products provide a flexible configuration format that combines the best of traditional formats and newer styles such as JSON and YAML.

The NATS configuration file supports the following syntax:

- Lines can be commented with `#` and `//`
- Values can be assigned to properties with:
	- Equals sign: `foo = 2`
	- Colon: `foo: 2`
	- Whitespace: `foo 2`
- Arrays are enclosed in brackets: `[...]`
- Maps are enclosed in braces: `{...}`
- Maps can be assigned with no key separator
- Semicolons can be used as terminators

### Strings and Numbers

The configuration parser is very forgiving, as you have seen:
- values can be a primitive, or a list, or a map
- strings and numbers typically do the right thing

String values that start with a number _can_ create issues. To force such values as strings, simply quote them.

*BAD Config*: 
```
listen: 127.0.0.1:4222
authorization: {
	# BAD!
	token: 3secret
}
```

Fixed Config:
```
listen: 127.0.0.1:4222
authorization: {
	token: "3secret"
}
```

### Variables

Server configurations can specify variables. Variables allow you to reference a value from one or more sections in the configuration. 

Variables:
- Are block scoped
- Are referenced with a `$` prefix.
- Can be resolved from the environment variables having the same name

> If the environment variable value begins with a number you may have trouble resolving it depending on the server version you are running.


```
# Define a variable in the config
TOKEN: "secret"

# Reference the variable
authorization {
	token: $TOKEN
}
```

A similar configuration, but this time, the value is in the environment:

```
# TOKEN should be defined in the environment
authorization {
	token: $TOKEN
}
```

export TOKEN="hello"; nats-server -c /config/file

### Include Directive

The `include` directive allows you to split a server configuration into several files. This is useful for separating configuration into chunks that you can easily reuse between different servers.

Includes *must* use relative paths, and are relative to the main configuration (the one specified via the `-c` option):

server.conf:
```
listen: 127.0.0.1:4222
include ./auth.conf
```

> Note that `include` is not followed by `=` or `:`, as it is a _directive_.

auth.conf:
```
authorization: {
	token: "f0oBar"
}
```

```
> nats-server -c server.conf
```


### Configuration Reloading

A server can reload most configuration changes without requiring a server restart or clients to disconnect by sending the nats-server a [signal](/nats_admin/signals.md):

```
> nats-server --signal reload
```




