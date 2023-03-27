# NATS Config

## Built-in Types

**Scalars**

- `string`
- `float`
- `integer`
- `boolean`
- `duration`
- `any`

**Containers**

- `object` - Object with defined `properties`
- `map(T)` - Map with `T` as the value type. Keys are implicitly `string` type.
- `array(T)` - Array with `T` as the element types.

## Custom Types

Custom types are declared in a YAML file under a top-level key named `types`.

```yaml
---
types:
  foo:
    type: object
    properties:
      a:
        type: string
      b:
        type: integer
      c:
        type: bar
```
