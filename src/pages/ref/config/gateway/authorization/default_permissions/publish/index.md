# publish

/ [Server Config](/ref/config/index.md) / [gateway](/ref/config/gateway/index.md) / [authorization](/ref/config/gateway/authorization/index.md) / [default_permissions](/ref/config/gateway/authorization/default_permissions/index.md) 

A single subject, list of subjects, or a allow-deny map of
subjects for publishing. Specifying a single subject or list
of subjects denotes an *allow* and implcitly denies publishing
to all other subjects.

*Aliases*

- `pub`


*Reloadable*: `true`

*Types*

- `string`
- `array(string)`
- `allow-deny-map`


## Examples

### Allow publish to `foo`
```
foo
```
### Allow publish on `foo` and `bar.*`
```
[foo, bar.*]
```
### Allow publish to `foo.*` except `foo.bar`
```
{
  allow: "foo.*"
  deny: "foo.bar"
}
```

