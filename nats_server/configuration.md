## Configuration File Format

The NATS server products provide a flexible configuration format that combines the best of traditional formats and newer styles such as JSON and YAML.

The config file supports the following syntax:

- Lines or options can be commented with `#` and `//`
- Value assignment can use:
	- Equals sign: `foo = 2`
	- Colon: `foo: 2`
	- Whitespace: `foo 2`
- Arrays are enclosed in brackets: `[...]`
- Maps are enclosed in braces: `{...}`
- Maps can be assigned with no key separator
- Semicolons can be used as terminators

### Variables

Server configurations can specify variables. Variables allow you to reference a value from one or more sections in the configuration. 

Variables:
- Are block scoped
- Are referenced with a `$` prefix.
- Can be resolved from the environment

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
authorization {
	token: $TOKEN
}
```

export TOKEN="hello"; nats-server -c /config/file
