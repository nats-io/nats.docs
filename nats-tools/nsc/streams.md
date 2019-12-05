# Streams

To share messages you publish with other accounts, you have to _Export_ a _Stream_. _Exports_ are associated with the account performing the export and advertised in exporting account’s JWT.

### Adding a Public Stream Export

To add a stream to your account:

```bash
> nsc add export --name abc --subject "a.b.c.>"
  [ OK ] added public stream export "abc"
```

> Note that we have exported stream with a subject that contains a wildcard. Any subject that matches the pattern will be exported.

To review the stream export:

```text
> nsc describe account
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ A                                                        │
│ Account ID                │ ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE │
│ Issuer ID                 │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                    │ 2019-12-05 13:35:42 UTC                                  │
│ Expires                   │                                                          │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Max Connections           │ Unlimited                                                │
│ Max Leaf Node Connections │ Unlimited                                                │
│ Max Data                  │ Unlimited                                                │
│ Max Exports               │ Unlimited                                                │
│ Max Imports               │ Unlimited                                                │
│ Max Msg Payload           │ Unlimited                                                │
│ Max Subscriptions         │ Unlimited                                                │
│ Exports Allows Wildcards  │ True                                                     │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Imports                   │ None                                                     │
╰───────────────────────────┴──────────────────────────────────────────────────────────╯

╭───────────────────────────────────────────────────────────╮
│                          Exports                          │
├──────┬────────┬─────────┬────────┬─────────────┬──────────┤
│ Name │ Type   │ Subject │ Public │ Revocations │ Tracking │
├──────┼────────┼─────────┼────────┼─────────────┼──────────┤
│ abc  │ Stream │ a.b.c.> │ Yes    │ 0           │ N/A      │
╰──────┴────────┴─────────┴────────┴─────────────┴──────────╯
```

Messages this account publishes on `a.b.c.>` will be forwarded to all accounts that import this stream.

### Importing a Stream

Importing a stream enables you to receive messages that are published by a different _Account_. To import a Stream, you have to create an _Import_. To create an _Import_ you need to know:

- The exporting account’s public key
- The subject where the stream is published
- You can map the stream’s subject to a different subject
- Self-imports are not valid; you can only import streams from other accounts.

To learn how to inspect a JWT from an account server, [check this article](../nas/inspecting_jwts.md).

With the required information, we can add an import to the public stream.

```bash
> nsc add account B
[ OK ] generated and stored account key "AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H"
[ OK ] added account "B"


> nsc add import --src-account ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE --remote-subject "a.b.c.>"
[ OK ] added stream import "a.b.c.>"
```

> Notice that messages published by the remote account will be received on the same subject as the are originally published. Sometimes you would like to prefix messages received from a stream. To add a prefix specify `--local-subject`.  Subscribers in our account can listen to `abc.>`. For example if `--local-subject abc`, The message will be received as `abc.a.b.c.>`.

And verifying it:

```text
> nsc describe account
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ B                                                        │
│ Account ID                │ AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │
│ Issuer ID                 │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                    │ 2019-12-05 13:39:55 UTC                                  │
│ Expires                   │                                                          │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Max Connections           │ Unlimited                                                │
│ Max Leaf Node Connections │ Unlimited                                                │
│ Max Data                  │ Unlimited                                                │
│ Max Exports               │ Unlimited                                                │
│ Max Imports               │ Unlimited                                                │
│ Max Msg Payload           │ Unlimited                                                │
│ Max Subscriptions         │ Unlimited                                                │
│ Exports Allows Wildcards  │ True                                                     │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Exports                   │ None                                                     │
╰───────────────────────────┴──────────────────────────────────────────────────────────╯

╭─────────────────────────────────────────────────────────────────────────────╮
│                                   Imports                                   │
├─────────┬────────┬─────────┬──────────────┬─────────┬──────────────┬────────┤
│ Name    │ Type   │ Remote  │ Local/Prefix │ Expires │ From Account │ Public │
├─────────┼────────┼─────────┼──────────────┼─────────┼──────────────┼────────┤
│ a.b.c.> │ Stream │ a.b.c.> │              │         │ A            │ Yes    │
╰─────────┴────────┴─────────┴──────────────┴─────────┴──────────────┴────────╯
```

Let's also add user to make requests from the service:

```bash
> nsc add user b
[ OK ] generated and stored user key "UDKNTNEL5YD66U2FZZ2B3WX2PLJFKEFHAPJ3NWJBFF44PT76Y2RAVFVE"
[ OK ] generated user creds file "~/.nkeys/creds/O/B/b.creds"
[ OK ] added user "b" to account "B"
```

### Testing the Stream

```bash 
> nsc sub --account B --user b "a.b.c.>"
Listening on [a.b.c.>]
...
> nsc pub --account A --user U a.b.c.hello world
Published [a.b.c.hello] : "world"
...
[#1] received on [a.b.c.hello]: 'world'
```

## Securing Streams

If you want to create a stream that is only accessible to accounts you designate you can create a _private_ stream. The export will be visible in your account, but _subscribing_ accounts will require an authorization token that must be created by you and generated specifically for the subscribing account.

The authorization token is simply a JWT signed by your account where you authorize the client account to import your export.

### Creating a Private Stream Export

```text
> nsc add export --subject "private.abc.*" --private --account A
[ OK ] added private stream export "private.abc.*"
```

Like before we defined an export, but this time we added the `--private` flag. The other thing to note is that the subject for the request has a wildcard. This enables the account to map specific subjects to specifically authorized accounts.

```text
> nsc describe account A
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ A                                                        │
│ Account ID                │ ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE │
│ Issuer ID                 │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                    │ 2019-12-05 14:24:02 UTC                                  │
│ Expires                   │                                                          │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Max Connections           │ Unlimited                                                │
│ Max Leaf Node Connections │ Unlimited                                                │
│ Max Data                  │ Unlimited                                                │
│ Max Exports               │ Unlimited                                                │
│ Max Imports               │ Unlimited                                                │
│ Max Msg Payload           │ Unlimited                                                │
│ Max Subscriptions         │ Unlimited                                                │
│ Exports Allows Wildcards  │ True                                                     │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Imports                   │ None                                                     │
╰───────────────────────────┴──────────────────────────────────────────────────────────╯

╭──────────────────────────────────────────────────────────────────────────╮
│                                 Exports                                  │
├───────────────┬────────┬───────────────┬────────┬─────────────┬──────────┤
│ Name          │ Type   │ Subject       │ Public │ Revocations │ Tracking │
├───────────────┼────────┼───────────────┼────────┼─────────────┼──────────┤
│ abc           │ Stream │ a.b.c.>       │ Yes    │ 0           │ N/A      │
│ private.abc.* │ Stream │ private.abc.* │ No     │ 0           │ N/A      │
╰───────────────┴────────┴───────────────┴────────┴─────────────┴──────────╯
```


### Generating an Activation Token

For a foreign account to _import_ a private stream, you have to generate an activation token. The activation token in addition to granting permissions to the account, it also allows you to subset the exported stream’s subject.

To generate a token, you’ll need to know the public key of the account importing the service. We can easily find the public key for account B by doing: 

```bash
> nsc list keys --account B
╭──────────────────────────────────────────────────────────────────────────────────────────╮
│                                           Keys                                           │
├────────┬──────────────────────────────────────────────────────────┬─────────────┬────────┤
│ Entity │ Key                                                      │ Signing Key │ Stored │
├────────┼──────────────────────────────────────────────────────────┼─────────────┼────────┤
│ O      │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │             │ *      │
│  B     │ AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │             │ *      │
│   b    │ UDKNTNEL5YD66U2FZZ2B3WX2PLJFKEFHAPJ3NWJBFF44PT76Y2RAVFVE │             │ *      │
╰────────┴──────────────────────────────────────────────────────────┴─────────────┴────────╯
```

```bash
> nsc generate activation --account A --target-account AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H --subject private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H -o /tmp/activation.jwt
[ OK ] generated "private.abc.*" activation for account "AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H"
[ OK ] wrote account description to "/tmp/activation.jwt"
```

The command took the account that has the export ('A'), the public key of account B, the subject where the stream will publish to account B.

For completeness, the contents of the JWT file look like this:

```text
> cat /tmp/activation.jwt
-----BEGIN NATS ACTIVATION JWT-----
eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJIS1FPQU9aQkVKS1JYNFJRUVhXS0xYSVBVTlNOSkRRTkxXUFBTSTQ3NkhCVVNYT0paVFFRIiwiaWF0IjoxNTc1NTU1OTczLCJpc3MiOiJBREVUUFQzNldCSUJVS00zSUJDVk00QTVZVVNEWEZFSlBXNE02R0dWQllDQlc3UlJORlRWNU5HRSIsIm5hbWUiOiJwcml2YXRlLmFiYy5BQU00NkUzWUY1V09aU0U1V05ZV0hOM1lZSVNWWk9TSTZYSFRGMlE2NEVDUFhTRlFaUk9KTVAySCIsInN1YiI6IkFBTTQ2RTNZRjVXT1pTRTVXTllXSE4zWVlJU1ZaT1NJNlhIVEYyUTY0RUNQWFNGUVpST0pNUDJIIiwidHlwZSI6ImFjdGl2YXRpb24iLCJuYXRzIjp7InN1YmplY3QiOiJwcml2YXRlLmFiYy5BQU00NkUzWUY1V09aU0U1V05ZV0hOM1lZSVNWWk9TSTZYSFRGMlE2NEVDUFhTRlFaUk9KTVAySCIsInR5cGUiOiJzdHJlYW0ifX0.yD2HWhRQYUFy5aQ7zNV0YjXzLIMoTKnnsBB_NsZNXP-Qr5fz7nowyz9IhoP7UszkN58m__ovjIaDKI9ml0l9DA
------END NATS ACTIVATION JWT------
```

When decoded it looks like this:

```text
> nsc describe jwt -f /tmp/activation.jwt 
╭────────────────────────────────────────────────────────────────────────────────────────╮
│                                       Activation                                       │
├─────────────────┬──────────────────────────────────────────────────────────────────────┤
│ Name            │ private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │
│ Account ID      │ AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H             │
│ Issuer ID       │ ADETPT36WBIBUKM3IBCVM4A5YUSDXFEJPW4M6GGVBYCBW7RRNFTV5NGE             │
│ Issued          │ 2019-12-05 14:26:13 UTC                                              │
│ Expires         │                                                                      │
├─────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Hash ID         │ GWIS5YCSET4EXEOBXVMQKXAR4CLY4IIXFV4MEMRUXPSQ7L4YTZ4Q====             │
├─────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Import Type     │ Stream                                                               │
│ Import Subject  │ private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │
├─────────────────┼──────────────────────────────────────────────────────────────────────┤
│ Max Messages    │ Unlimited                                                            │
│ Max Msg Payload │ Unlimited                                                            │
│ Network Src     │ Any                                                                  │
│ Time            │ Any                                                                  │
╰─────────────────┴──────────────────────────────────────────────────────────────────────╯
```

The token can be shared directly with the client account. 

> If you manage many tokens for many accounts, you may want to host activation tokens on a web server and share the URL with the account. The benefit to the hosted approach is that any updates to the token would be available to the importing account whenever their account is updated, provided the URL you host them in is stable.

## Importing a Private Stream

Importing a private stream is more natural than a public one as the activation token given to you already has all the necessary details. Note that the token can be an actual file path or a remote URL.

```text
> nsc add import --account B --token /tmp/activation.jwt 
[ OK ] added stream import "private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H"
```

```text
> nsc describe account B
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ B                                                        │
│ Account ID                │ AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │
│ Issuer ID                 │ OAFEEYZSYYVI4FXLRXJTMM32PQEI3RGOWZJT7Y3YFM4HB7ACPE4RTJPG │
│ Issued                    │ 2019-12-05 14:29:16 UTC                                  │
│ Expires                   │                                                          │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Max Connections           │ Unlimited                                                │
│ Max Leaf Node Connections │ Unlimited                                                │
│ Max Data                  │ Unlimited                                                │
│ Max Exports               │ Unlimited                                                │
│ Max Imports               │ Unlimited                                                │
│ Max Msg Payload           │ Unlimited                                                │
│ Max Subscriptions         │ Unlimited                                                │
│ Exports Allows Wildcards  │ True                                                     │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Exports                   │ None                                                     │
╰───────────────────────────┴──────────────────────────────────────────────────────────╯

╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                Imports                                                                                                │
├──────────────────────────────────────────────────────────────────────┬────────┬──────────────────────────────────────────────────────────────────────┬──────────────┬─────────┬──────────────┬────────┤
│ Name                                                                 │ Type   │ Remote                                                               │ Local/Prefix │ Expires │ From Account │ Public │
├──────────────────────────────────────────────────────────────────────┼────────┼──────────────────────────────────────────────────────────────────────┼──────────────┼─────────┼──────────────┼────────┤
│ a.b.c.>                                                              │ Stream │ a.b.c.>                                                              │              │         │ A            │ Yes    │
│ private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │ Stream │ private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H │              │         │ A            │ No     │
╰──────────────────────────────────────────────────────────────────────┴────────┴──────────────────────────────────────────────────────────────────────┴──────────────┴─────────┴──────────────┴────────╯
```

### Testing the Private Stream

Testing a private stream is no different than a public one:

```bash 
> nsc sub --account B --user b private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H
Listening on [private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H]
...
> nsc pub --account A --user U private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H hello
Published [private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H] : "hello"
...
[#1] received on [private.abc.AAM46E3YF5WOZSE5WNYWHN3YYISVZOSI6XHTF2Q64ECPXSFQZROJMP2H]: 'hello'
```

