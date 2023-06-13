# ocsp

OCSP Stapling is honored by default for certificates that have the
`status_request` `Must-Staple` flag. If explicitly disabled, the
server will not request staples even if `Must-Staple` is present.

*Default value*: `true`

*Reloadable*: Yes

*Types*

- `boolean`
- `ocsp`


