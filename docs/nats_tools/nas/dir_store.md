## Directory Store


### NATS Account Server Configuration

```
OperatorJWTPath: "/users/synadia/.nsc/nats/Test/Test.jwt",
http {
	port: 9090
},
store {
	dir: "/tmp/as_store",
	readonly: false,
	shard: true
}
```

### To Add/Update a JWT

```
> curl -i -X POST localhost:9090/jwt/v1/accounts/AC7PO3MREV26U3LFZFP5BN3HAI32X3PKLBRVMPAETLEHWPQEUG7EJY4H --data-binary @/Users/synadia/.nsc/nats/Test/accounts/TestAccount/TestAccount.jwt -H "Content-Type: text/text"
```

Note that the `@` before the file name is required for curl to read the specified file, and use it as the payload. Otherwise it will simply post the path specified, which will result in an update error.