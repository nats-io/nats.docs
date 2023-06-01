# default_permissions

/ [Config](../../../index.md) / [cluster](../../index.md) / [authorization](../index.md) 

The default permissions applied to users, if permissions are
not explicitly defined for them.

## Properties

### [`publish`](publish/index.md)

A single subject, list of subjects, or a allow-deny map of
subjects for publishing. Specifying a single subject or list
of subjects denotes an *allow* and implcitly denies publishing
to all other subjects.

### [`subscribe`](subscribe/index.md)

A single subject, list of subjects, or a allow-deny map of
subjects for subscribing. Note, that the subject permission can
have an optional second value declaring a queue name.

### [`allow_responses`](allow_responses/index.md)



