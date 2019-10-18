# Services

To share services that other accounts can reach via request reply, you have to _Export_ a _Service_. _Services_ are associated with the account performing the replies and are advertised in the exporting accounts' JWT.

## Adding a Public Service Export

To add a service to your account:

```text
> nsc add export --name "srv" --subject "help" --service
Success! - added public service export "srv"
```

To review the service export:

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
│ help │ Service │ help    │ Yes    │
╰──────┴─────────┴─────────┴────────╯
```

## Importing a Service

Importing a service enables you to send requests to the remote _Account_. To import a Service, you have to create an _Import_. To create an import you need to know:

- The exporting account’s public key
- The subject the service is listening on
- You can map the service’s subject to a different subject
- Self-imports are not valid; you can only import services from other accounts.

To learn how to inspect a JWT from an account server, [check this article](../nas/inspecting_jwts.md).


```text
> nsc add import --src-account AC7PO3MREV26U3LFZFP5BN3HAI32X3PKLBRVMPAETLEHWPQEUG7EJY4H --remote-subject help --service
Success! - added service import "help"
```

Verifying our work:

```text
> nsc describe account
╭────────────────────────────────────────────────────╮
│                  Account Details                   │
├──────────────────────────┬─────────────────────────┤
│ Name                     │ AccountB                │
│ Account ID               │ AAL5Q2B3SMSO            │
│ Issuer ID                │ OAYI3YUZSWDN            │
│ Issued                   │ 2019-04-29 14:37:49 UTC │
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

╭─────────────────────────────────────────────────────────────────────────╮
│                                 Imports                                 │
├─────────┬─────────┬─────────┬─────────┬─────────┬──────────────┬────────┤
│ Name    │ Type    │ Remote  │ Local   │ Expires │ From Account │ Public │
├─────────┼─────────┼─────────┼─────────┼─────────┼──────────────┼────────┤
│ help    │ Service │ help    │ help    │         │ AC7PO3MREV26 │ Yes    │
╰─────────┴─────────┴─────────┴─────────┴─────────┴──────────────┴────────╯
```

### Testing the Service

To test the service, we can install the `nats-req` and `nats-rply` tools:

Set up a process to handle the request:
```text
> go get github.com/nats-io/nats.go/examples/nats-rply

> nats-rply -creds ~/.nkeys/Test/accounts/AccountB/users/userb.creds "help" "I will help"                
Listening on [help]
```

Send the request:
```text
> go get github.com/nats-io/nats.go/examples/nats-req
> nats-req -creds ~/.nkeys/Test/accounts/AccountB/users/userb.creds help me
Published [help] : 'me'
```

The service receives the request:
```text
[#1] Received on [help]: 'me'
```

And the response is received by the requestor:
```text
Received  [_INBOX.v6KAX0v1bu87k49hbg3dgn.StIGJF0D] : 'I will help'
```

## Securing Services

If you want to create a service that is only accessible to accounts you designate you can create a _private_ service. The export will be visible in your account, but subscribing accounts will require an authorization token that must be created by you and generated specifically for the requesting account.

Let’s create an account and user for our stream client:
```text
> nsc add account --name AccountB
Generated account key - private key stored “~/.nkeys/Test/accounts/AccountB/AccountB"
Success! - added account "AccountB"

> nsc add user --name userb
Generated user key - private key stored "~/.nkeys/Test/accounts/AccountB/users/userb”
Generated user creds file "~/.nkeys/Test/accounts/AccountB/users/userb.creds"
Success! - added user “userb” to “AccountB”
```

The authorization token is simply a JWT signed by your account where you authorize the client account to import your service.

### Creating a Private Service Export

```text
> nsc add export --name phelp --subject "help.>" --private --service
Success! - added private service export "phelp"
```

As before, we declared an export, but this time we added the `--private` flag. The other thing to note is that the subject for the request has a wildcard. This enables the account to map specific subjects to specifically authorized accounts.

```text
> nsc describe account
╭────────────────────────────────────────────────────╮
│                  Account Details                   │
├──────────────────────────┬─────────────────────────┤
│ Name                     │ TestAccount             │
│ Account ID               │ AC7PO3MREV26            │
│ Issuer ID                │ OAYI3YUZSWDN            │
│ Issued                   │ 2019-04-29 14:59:42 UTC │
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

╭────────────────────────────────────╮
│              Exports               │
├───────┬─────────┬─────────┬────────┤
│ Name  │ Type    │ Subject │ Public │
├───────┼─────────┼─────────┼────────┤
│ phelp │ Service │ help.>  │ No     │
╰───────┴─────────┴─────────┴────────╯
```

### Generating an Activation Token

For the foreign account to _import_ a private service and be able to send requests, you have to generate an activation token. The activation token in addition to granting permission to the account allows you to subset the service’s subject:

To generate a token, you’ll need to know the public key of the account importing the service.

```text
> nsc generate activation -o /tmp/activation.jwt --target-account AAL5Q2B3SMSO5AS3APJFUNAIKUCEQJPAQ76XEBTVOCQCXXGKP3YMGGN4 --subject "help.AAL5Q2B3SM" --service
generated "phelp" activation for account "AAL5Q2B3SMSO5AS3APJFUNAIKUCEQJPAQ76XEBTVOCQCXXGKP3YMGGN4".
JTI is "IY4ZUWLNLOTO5N5UDLOFEBCOMHB6MKQMK4ZELA2BSPKMXSEARXOA"
```

In the above invocation, we generated an activation redirecting the output to `/tmp/activation.jwt`. The activation only allows the client account to perform requests on `help.AAL5Q2B3SM`.

For completeness, the contents of the JWT file looks like this:

```text
> cat /tmp/activation.jwt
-----BEGIN NATS ACTIVATION JWT-----
eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJJWTRaVVdMTkxPVE81TjVVRExPRkVCQ09NSEI2TUtRTUs0WkVMQTJCU1BLTVhTRUFSWE9BIiwiaWF0IjoxNTU2NTUwMDczLCJpc3MiOiJBQzdQTzNNUkVWMjZVM0xGWkZQNUJOM0hBSTMyWDNQS0xCUlZNUEFFVExFSFdQUUVVRzdFSlk0SCIsIm5hbWUiOiJoZWxwLkFBTDVRMkIzU00iLCJzdWIiOiJBQUw1UTJCM1NNU081QVMzQVBKRlVOQUlLVUNFUUpQQVE3NlhFQlRWT0NRQ1hYR0tQM1lNR0dONCIsInR5cGUiOiJhY3RpdmF0aW9uIiwibmF0cyI6eyJzdWJqZWN0IjoiaGVscC5BQUw1UTJCM1NNIiwidHlwZSI6InNlcnZpY2UifX0.VFYHPA0e67RFR-XFy7Q7pS90hzZvP5k3OsldjaDrIXP4UdpuQeUhv9qK9EMK40pcgH6NzJ7gmaZLU6RpAcbXAg
------END NATS ACTIVATION JWT------
```

When decoded it looks like this:

```text
> nsc describe jwt -f /tmp/activation.jwt
╭───────────────────────────────────────────╮
│                Activation                 │
├─────────────────┬─────────────────────────┤
│ Import Type     │ Service                 │
│ Import Subject  │ help.AAL5Q2B3SM         │
│ Account ID      │ AAL5Q2B3SMSO            │
│ Issuer ID       │ AC7PO3MREV26            │
│ Issued          │ 2019-04-29 15:01:13 UTC │
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

## Importing a Private Service

As with streams, importing a private service is more natural than a public one because the activation token stores all the necessary details. Again, the token can be an actual file path or a remote URL.

```text
> nsc describe account
╭────────────────────────────────────────────────────╮
│                  Account Details                   │
├──────────────────────────┬─────────────────────────┤
│ Name                     │ AccountB                │
│ Account ID               │ AAL5Q2B3SMSO            │
│ Issuer ID                │ OAYI3YUZSWDN            │
│ Issued                   │ 2019-04-29 15:26:39 UTC │
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

╭─────────────────────────────────────────────────────────────────────────────────╮
│                                     Imports                                     │
├─────────┬─────────┬─────────────────┬─────────┬─────────┬──────────────┬────────┤
│ Name    │ Type    │ Remote          │ Local   │ Expires │ From Account │ Public │
├─────────┼─────────┼─────────────────┼─────────┼─────────┼──────────────┼────────┤
│ help    │ Service │ help.AAL5Q2B3SM │ help    │         │ AC7PO3MREV26 │ No     │
╰─────────┴─────────┴─────────────────┴─────────┴─────────┴──────────────┴────────╯
```


### Testing the Private Service

Start the replier:

```text
> nats-rply -creds ~/.nkeys/Test/accounts/TestAccount/users/TestUser.creds "help.>" "I will help"
Listening on [help.>]
```


Send a request:
```text
> nats-req -creds ~/.nkeys/Test/accounts/AccountB/users/userb.creds help me           
Published [help] : 'me'
```

The service receives the message:
```text
[#1] Received on [help.AAL5Q2B3SM]: 'me'
```

The requester receives its response:
```text
Received  [_INBOX.N3IiqWbiAQfPoINCBpBrUM.ZjBNtkB3] : 'I will help'
```
