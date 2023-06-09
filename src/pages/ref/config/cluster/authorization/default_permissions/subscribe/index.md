# subscribe

/ [Server Config](/ref/config/index.md) / [cluster](/ref/config/cluster/index.md) / [authorization](/ref/config/cluster/authorization/index.md) / [default_permissions](/ref/config/cluster/authorization/default_permissions/index.md) 

A single subject, list of subjects, or a allow-deny map of
subjects for subscribing. Note, that the subject permission can
have an optional second value declaring a queue name.

*Aliases*

- `sub`


*Reloadable*: `true`

*Types*

- `string`
- `array(string)`
- `allow-deny-map`


## Examples

### Allow subscribe on `foo`
```
foo
```
### Allow subscribe on `foo` in group matching `*.dev`
```
foo *.dev
```
### Allow subscribe on `foo.>` and `bar` in group `v1`
```
[foo.>, "bar v1"]
```
### Allow subscribe to `foo.*` except `foo.bar`
```
{
  allow: "foo.*"
  deny: "foo.bar"
}
```

