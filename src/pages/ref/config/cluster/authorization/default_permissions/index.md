# default_permissions

The default permissions applied to users, if permissions are
not explicitly defined for them.

*Reloadable*: Yes

*Types*

- `object`


## Properties

| Name | Description | Default | Reloadable |
| :--- | :---------- | :------ | :--------- |
| [publish](/ref/config/cluster/authorization/default_permissions/publish) | A single subject, list of subjects, or a allow-deny map of subjects for publishing. Specifying a single subject or list of subjects denotes an *allow* and implcitly denies publishing to all other subjects. | `-` | Yes |
| [subscribe](/ref/config/cluster/authorization/default_permissions/subscribe) | A single subject, list of subjects, or a allow-deny map of subjects for subscribing. Note, that the subject permission can have an optional second value declaring a queue name. | `-` | Yes |
| [allow_responses](/ref/config/cluster/authorization/default_permissions/allow_responses) |  | `-` | Yes |
