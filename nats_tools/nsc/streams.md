## Streams

To share messages you publish with other accounts, you have to _Export_ a _Stream_. _Exports_ are associated with the account performing the export and advertised in exporting account’s JWT.

### Adding a Public Stream Export

To add a stream to your account:

```text
> nsc add export --name "abc" --subject "a.b.c.>"
Success! - added public stream export "abc"
```

> Note that we have exported stream with a subject that contains a wildcard. Any subject that matches the pattern will be exported.

To check that the export is how you intended:

```text
> nsc describe account
╭────────────────────────────────────────────────────╮
│                  Account Details                   │
├──────────────────────────┬─────────────────────────┤
│ Name                     │ TestAccount             │
│ Account ID               │ AC7PO3MREV26            │
│ Issuer ID                │ OAYI3YUZSWDN            │
│ Issued                   │ 2019-04-29 14:20:13 UTC │
│ Expires                  │                         │
├──────────────────────────┼─────────────────────────┤
│ Max Connections          │ Unlimited               │
│ Max Data                 │ Unlimited               │
│ Max Exports              │ Unlimited               │
│ Max Imports              │ Unlimited               │
│ Max Msg Payload          │ Unlimited               │
│ Max Subscriptions        │ Unlimited               │
│ Exports Allows Wildcards │ True                    │
├──────────────────────────┼─────────────────────────┤
│ Imports                  │ None                    │
╰──────────────────────────┴─────────────────────────╯

╭───────────────────────────────────╮
│              Exports              │
├──────┬─────────┬─────────┬────────┤
│ Name │ Type    │ Subject │ Public │
├──────┼─────────┼─────────┼────────┤
│ abc  │ Stream  │ a.b.c.> │ Yes    │
╰──────┴─────────┴─────────┴────────╯
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

```text
> nsc add import --src-account AC7PO3MREV26U3LFZFP5BN3HAI32X3PKLBRVMPAETLEHWPQEUG7EJY4H --remote-subject "a.b.c.>" --local-subject "abc.>"
Success! - added stream import "a.b.c.>"
```

> Note we did fancy things here: The remote stream publishes messages as `a.b.c.>`, but we changed the prefix to be something else in the importing account’s subject space. We changed it to `abc.>`. Subscribers in our account can listen to `abc.>` to get the messages.

And verifying it:

```text
> nsc describe account
╭────────────────────────────────────────────────────╮
│                  Account Details                   │
├──────────────────────────┬─────────────────────────┤
│ Name                     │ AccountB                │
│ Account ID               │ AAL5Q2B3SMSO            │
│ Issuer ID                │ OAYI3YUZSWDN            │
│ Issued                   │ 2019-04-25 21:33:58 UTC │
│ Expires                  │                         │
├──────────────────────────┼─────────────────────────┤
│ Max Connections          │ Unlimited               │
│ Max Data                 │ Unlimited               │
│ Max Exports              │ Unlimited               │
│ Max Imports              │ Unlimited               │
│ Max Msg Payload          │ Unlimited               │
│ Max Subscriptions        │ Unlimited               │
│ Exports Allows Wildcards │ True                    │
├──────────────────────────┼─────────────────────────┤
│ Exports                  │ None                    │
╰──────────────────────────┴─────────────────────────╯

╭────────────────────────────────────────────────────────────────────╮
│                              Imports                               │
├───────┬────────┬─────────┬───────┬─────────┬──────────────┬────────┤
│ Name  │ Type   │ Remote  │ Local │ Expires │ From Account │ Public │
├───────┼────────┼─────────┼───────┼─────────┼──────────────┼────────┤
│ abc.> │ Stream │ a.b.c.> │ abc.> │         │ AC7PO3MREV26 │ Yes    │
╰───────┴────────┴─────────┴───────┴─────────┴──────────────┴────────╯
```

## Securing Streams

If you want to create a stream that is only accessible to accounts you designate you can create a _private_ stream. The export will be visible in your account, but _subscribing_ accounts will require an authorization token that must be created by you and generated specifically for the subscribing account.

The authorization token is simply a JWT signed by your account where you authorize the client account to import your export.

### Creating a Private Stream Export

```text
> nsc add export --name pabc --subject "a.b.c.>" --private
Success! - added private stream export "pabc"
```

Like before we defined an export, but this time we added the `--private` flag.

```text
> nsc describe account
╭────────────────────────────────────────────────────╮
│                  Account Details                   │
├──────────────────────────┬─────────────────────────┤
│ Name                     │ TestAccount             │
│ Account ID               │ AC7PO3MREV26            │
│ Issuer ID                │ OAYI3YUZSWDN            │
│ Issued                   │ 2019-04-25 21:51:02 UTC │
│ Expires                  │                         │
├──────────────────────────┼─────────────────────────┤
│ Max Connections          │ Unlimited               │
│ Max Data                 │ Unlimited               │
│ Max Exports              │ Unlimited               │
│ Max Imports              │ Unlimited               │
│ Max Msg Payload          │ Unlimited               │
│ Max Subscriptions        │ Unlimited               │
│ Exports Allows Wildcards │ True                    │
├──────────────────────────┼─────────────────────────┤
│ Imports                  │ None                    │
╰──────────────────────────┴─────────────────────────╯

╭──────────────────────────────────╮
│             Exports              │
├──────┬────────┬─────────┬────────┤
│ Name │ Type   │ Subject │ Public │
├──────┼────────┼─────────┼────────┤
│ pabc │ Stream │ a.b.c.> │ No     │
╰──────┴────────┴─────────┴────────╯
```


### Generating an Activation Token

For a foreign account to _import_ a private stream, you have to generate an activation token. The activation token in addition to granting permissions to the account, it also allows you to subset the exported stream’s subject.

Let’s create an account and user for our stream client:
```text
> nsc add account --name AccountB
Generated account key - private key stored “~/.nkeys/Test/accounts/AccountB/AccountB"
Success! - added account "AccountB"

> nsc add user --name userb
Generated user key - private key stored "~/.nkeys/Test/accounts/AccountB/users/userb”
Generated user creds file "~/.nkeys/Test/accounts/ACcountB/users/userb.creds"
Success! - added user “userb” to “AccountB”
```

To generate a token, you’ll need to know the public key of the account importing the stream.

```text
> nsc generate activation -o /tmp/activation.jwt --target-account AAL5Q2B3SMSO5AS3APJFUNAIKUCEQJPAQ76XEBTVOCQCXXGKP3YMGGN4 —subject a.b.c.d    
generated "pabc" activation for account "AAL5Q2B3SMSO5AS3APJFUNAIKUCEQJPAQ76XEBTVOCQCXXGKP3YMGGN4".
JTI is "VNT3Y32I5FNTEHIVL6PINEJNNZ6Z2BGGEJ2QWNA3TPQ4A4KBRGHQ"
```

In the above invocation, we generated an activation redirecting the output to `/tmp/activation.jwt`. The exporting account exported `a.b.c.>`, but on the activation token will only grant permission to `a.b.c.d` to the target account.

For completeness, the contents of the JWT file look like this:

```text
> cat /tmp/activation.jwt
-----BEGIN NATS ACTIVATION JWT-----
eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJWTlQzWTMySTVGTlRFSElWTDZQSU5FSk5OWjZaMkJHR0VKMlFXTkEzVFBRNEE0S0JSR0hRIiwiaWF0IjoxNTU2MjI5NDk0LCJpc3MiOiJBQzdQTzNNUkVWMjZVM0xGWkZQNUJOM0hBSTMyWDNQS0xCUlZNUEFFVExFSFdQUUVVRzdFSlk0SCIsIm5hbWUiOiJhLmIuYy5kIiwic3ViIjoiQUFMNVEyQjNTTVNPNUFTM0FQSkZVTkFJS1VDRVFKUEFRNzZYRUJUVk9DUUNYWEdLUDNZTUdHTjQiLCJ0eXBlIjoiYWN0aXZhdGlvbiIsIm5hdHMiOnsic3ViamVjdCI6ImEuYi5jLmQiLCJ0eXBlIjoic3RyZWFtIn19.eA0W-mcxFXyIpEk0MUgaLjj7t5jxEHTar7MNY5IYcJ7NHlDoHU5IFog2LlFW_hpTCFA4qa989vqECsiTuBuCAA
------END NATS ACTIVATION JWT------
```

When decoded it looks like this:

```text
> nsc describe jwt -f /tmp/activation.jwt 
╭───────────────────────────────────────────╮
│                Activation                 │
├─────────────────┬─────────────────────────┤
│ Import Type     │ Stream                  │
│ Import Subject  │ a.b.c.d                 │
│ Account ID      │ AAL5Q2B3SMSO            │
│ Issuer ID       │ AC7PO3MREV26            │
│ Issued          │ 2019-04-25 21:58:14 UTC │
│ Expires         │                         │
├─────────────────┼─────────────────────────┤
│ Max Messages    │ Unlimited               │
│ Max Msg Payload │ Unlimited               │
│ Network Src     │ Any                     │
│ Time            │ Any                     │
╰─────────────────┴─────────────────────────╯
```

The token can be shared directly with the client account. 

> If you manage many tokens for many accounts, you may want to host activation tokens on a web server and share the URL with the account. The benefit to the hosted approach is that any updates to the token would be available to the importing account whenever their account is updated, provided the URL you host them in is stable.

## Importing a Private Stream

Importing a private stream is more natural than a public one as the activation token given to you already has all the necessary details. Note that the token can be an actual file path or a remote URL.

```text
> nsc add import --token /tmp/activation.jwt 
Success! - added stream import "a.b.c.d"
```

```text
> nsc describe account
nsc describe account
╭────────────────────────────────────────────────────╮
│                  Account Details                   │
├──────────────────────────┬─────────────────────────┤
│ Name                     │ AccountB                │
│ Account ID               │ AAL5Q2B3SMSO            │
│ Issuer ID                │ OAYI3YUZSWDN            │
│ Issued                   │ 2019-04-25 22:04:29 UTC │
│ Expires                  │                         │
├──────────────────────────┼─────────────────────────┤
│ Max Connections          │ Unlimited               │
│ Max Data                 │ Unlimited               │
│ Max Exports              │ Unlimited               │
│ Max Imports              │ Unlimited               │
│ Max Msg Payload          │ Unlimited               │
│ Max Subscriptions        │ Unlimited               │
│ Exports Allows Wildcards │ True                    │
├──────────────────────────┼─────────────────────────┤
│ Exports                  │ None                    │
╰──────────────────────────┴─────────────────────────╯

╭────────────────────────────────────────────────────────────────────────╮
│                                Imports                                 │
├─────────┬────────┬─────────┬─────────┬─────────┬──────────────┬────────┤
│ Name    │ Type   │ Remote  │ Local   │ Expires │ From Account │ Public │
├─────────┼────────┼─────────┼─────────┼─────────┼──────────────┼────────┤
│ a.b.c.d │ Stream │ a.b.c.d │ a.b.c.d │         │ AC7PO3MREV26 │ No     │
╰─────────┴────────┴─────────┴─────────┴─────────┴──────────────┴────────╯
```

### Testing the Private Stream

Start the `nats-account-server`:
```text
  > nats-account-server -nsc ~/.nsc/nats/Test
```

Create a config for the nats server `server.conf`:
```text
operator: /Users/synadia/.nsc/nats/Test/Test.jwt
resolver: URL(http://localhost:9090/jwt/v1/accounts/)
```

Start the `nats-server`:
```text
> nats-server -c server.conf
```

Start the subscriber for the client account:
```text
> nats-sub -creds ~/.nkeys/Test/accounts/AccountB/users/userb.creds ">"
Listening on [>]
```

Publish messages to the stream:

```text
# Client won’t get this one since it only has permission
# for messages ‘a.b.c.d’
> nats-pub -creds ~/.nkeys/Test/accounts/TestAccount/users/TestUser.creds a.b.c.a "hello"
Published [a.b.c.a] : 'hello'

 > nats-pub -creds ~/.nkeys/Test/accounts/TestAccount/users/TestUser.creds a.b.c.d "hello"
Published [a.b.c.d] : 'hello'
```

The subscriber as expected prints a message on the stream that it was allowed to receive:

```text
[#1] Received on [a.b.c.d.a.b.c.d]: 'hello'
```


