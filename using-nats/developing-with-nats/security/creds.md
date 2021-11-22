# Authenticating with a Credentials File

The 2.0 version of NATS server introduced the idea of decentralized authentication based on [JSON Web Tokens \(JWT\)](https://jwt.io/). Clients interact with this new scheme using a [user JWT](../../nats-server/configuration/securing_nats/jwt/) and corresponding [NKey](../../../running-a-nats-service/configuration/securing_nats/auth_intro/nkey_auth.md) private key. To help make connecting with a JWT easier, the client libraries support the concept of a credentials file. This file contains both the private key and the JWT and can be generated with the `nsc` [tool](../../using-nats/nats-tools/nsc/). The contents will look like the following and should be protected because it contains a private key. This credentials file is unused and only for example purposes.

```text
-----BEGIN NATS USER JWT-----
eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJUVlNNTEtTWkJBN01VWDNYQUxNUVQzTjRISUw1UkZGQU9YNUtaUFhEU0oyWlAzNkVMNVJBIiwiaWF0IjoxNTU4MDQ1NTYyLCJpc3MiOiJBQlZTQk0zVTQ1REdZRVVFQ0tYUVM3QkVOSFdHN0tGUVVEUlRFSEFKQVNPUlBWV0JaNEhPSUtDSCIsIm5hbWUiOiJvbWVnYSIsInN1YiI6IlVEWEIyVk1MWFBBU0FKN1pEVEtZTlE3UU9DRldTR0I0Rk9NWVFRMjVIUVdTQUY3WlFKRUJTUVNXIiwidHlwZSI6InVzZXIiLCJuYXRzIjp7InB1YiI6e30sInN1YiI6e319fQ.6TQ2ilCDb6m2ZDiJuj_D_OePGXFyN3Ap2DEm3ipcU5AhrWrNvneJryWrpgi_yuVWKo1UoD5s8bxlmwypWVGFAA
------END NATS USER JWT------

************************* IMPORTANT *************************
NKEY Seed printed below can be used to sign and prove identity.
NKEYs are sensitive and should be treated as secrets.

-----BEGIN USER NKEY SEED-----
SUAOY5JZ2WJKVR4UO2KJ2P3SW6FZFNWEOIMAXF4WZEUNVQXXUOKGM55CYE
------END USER NKEY SEED------

*************************************************************
```

Given a creds file, a client can authenticate as a specific user belonging to a specific account:

{% tabs %}
{% tab title="Go" %}
```go
nc, err := nats.Connect("127.0.0.1", nats.UserCredentials("path_to_creds_file"))
if err != nil {
    log.Fatal(err)
}
defer nc.Close()

// Do something with the connection
```
{% endtab %}

{% tab title="Java" %}
```java
Options options = new Options.Builder().
            server("nats://localhost:4222").
            authHandler(Nats.credentials("path_to_creds_file")).
            build();
Connection nc = Nats.connect(options);

// Do something with the connection

nc.close();
```
{% endtab %}

{% tab title="JavaScript" %}
```javascript
// credentials file contains the JWT and the secret signing key
  const authenticator = credsAuthenticator(creds);
  const nc = await connect({
    port: ns.port,
    authenticator: authenticator,
});
```
{% endtab %}

{% tab title="Python" %}
```python
nc = NATS()

async def error_cb(e):
    print("Error:", e)

await nc.connect("nats://localhost:4222",
                 user_credentials="path_to_creds_file",
                 error_cb=error_cb,
                 )

# Do something with the connection

await nc.close()
```
{% endtab %}

{% tab title="C" %}
```c
natsConnection      *conn      = NULL;
natsOptions         *opts      = NULL;
natsStatus          s          = NATS_OK;

s = natsOptions_Create(&opts);
if (s == NATS_OK)
    // Pass the credential file this way if the file contains both user JWT and seed.
    // Otherwise, if the content is split, the first file is the user JWT, the second
    // contains the seed.
    s = natsOptions_SetUserCredentialsFromFiles(opts, "path_to_creds_file", NULL);
if (s == NATS_OK)
    s = natsConnection_Connect(&conn, opts);

(...)

// Destroy objects that were created
natsConnection_Destroy(conn);
natsOptions_Destroy(opts);
```
{% endtab %}
{% endtabs %}

