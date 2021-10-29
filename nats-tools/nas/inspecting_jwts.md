# Inspecting JWTs

Let’s say that you know the account for a stream that you are interested in, but you don't know all the details for creating an import. If you know and have access to a nats-account-server, you can help yourself. The nats-account-server can decode a JWT and give you human readable values that you can use.

The endpoint for retrieving an account JWT is: `/jwt/v1/accounts/<account_id>`. To decode a JWT add the query string `?decode=true`.

```shell
curl http://localhost:9090/jwt/v1/accounts/AC7PO3MREV26U3LFZFP5BN3HAI32X3PKLBRVMPAETLEHWPQEUG7EJY4H\?decode=true
```
Example output
```text
{
    "typ": "jwt",
    "alg": "ed25519"
}
{
    "jti": "5YMRO4KNMYWQDMRAHVTT4KX63CA2L3M6F4VM3S7NNGPMCCATORXQ",
    "iat": 1556229062 (2019-04-25),
    "iss": "OAYI3YUZSWDNMERD2IN3HZSIP3JA2E3VDTXSTEVOIII273XL2NABJP64",
    "name": "TestAccount",
    "sub": "AC7PO3MREV26U3LFZFP5BN3HAI32X3PKLBRVMPAETLEHWPQEUG7EJY4H",
    "type": "account",
    "nats": {
        "exports": [
            {
                "name": "abc",
                "subject": "a.b.c.>",
                "type": "stream"
            }
        ],
…
```

As you can see from above, the JWT is decoded. The standard JWT claim field abbreviated names may be a little terse, so here's a list of the more important ones:

* `jti` is the _JWT ID_. All JWTs have one and they are unique.
* `iat` is _Issued At_ - the UNIX date \(number of seconds since 1970\) when the JWT was issued.
* `iss` is the _Issuer_. For NATS JWTs it is the public key of the issuer. In the example above the entity is an account, so the issuer will be an operator. Thus the id will always start with the letter `O`.
* `sub` is the _Subject_ of the claim. In NATS JWTs it is the public key of the entity of the claim is for. In the example above, it is an Account, so the issuer will always start with the letter `A`.

On the example above, we see that there is one export in this account, it is public \(`token_req` is `false` or not set\), and it is a `stream`. So this account exports a public stream. With that information you can create an import on the public stream.

