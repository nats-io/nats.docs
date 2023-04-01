# publish

/ [config](/ref/config/index.md) / [leafnodes](/ref/config/config/leafnodes/index.md) / [authorization](/ref/config/config/leafnodes/authorization/index.md) / [default_permissions](/ref/config/config/leafnodes/authorization/default_permissions/index.md)

A single subject, list of subjects, or a allow-deny map of
subjects for publishing. Specifying a single subject or list
of subjects denotes an _allow_ and implcitly denies publishing
to all other subjects.

_Aliases_

- `pub`

## Examples

Allow publish to `foo`

```
foo
```

Allow publish on `foo` and `bar.*`

```
[foo, bar.*]
```

Allow publish to `foo.*` except `foo.bar`

```
{
  allow: "foo.*"
  deny: "foo.bar"
}
```
