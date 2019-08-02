# Signing Keys

As previously discussed, NKEYs are identities, and if someone gets a hold of an account or operator nkey they can do everything you can do as you.

NATS has a strategies to let you deal with scenarios where your private keys escape out in the wild.

The first and most important line of defense is _Signing Keys_. _Signing Keys_ allow you have multiple NKEY identities of the same kind (Operator or Account) that have the same degree of trust as the standard _Issuer_ nkey.

The concept behind the signing key is that you can issue a JWT for an operator or an account that lists multiple nkeys. Typically the issuer will match the _Subject_ of the entity issuing the JWT. With SigningKeys, a JWT is considered valid if it is signed by the _Subject_ of the _Issuer_ or one of its signing keys. This enables guarding the private key of the Operator or Account more closely while allowing _Accounts_, _Users_ or _Activation Tokens_ be signed using alternate private keys.

If an issue should arise where somehow a signing key escapes into the wild, you would remove the compromised signing key from the entity, add a new one, and reissue the entity. When a JWT is validated, if the signing key is missing, the operation is rejected. You are also on the hook to re-issue all JWTs (accounts, users, activation tokens) that were signed with the compromised signing key.

This is effectively a large hammer. You can mitigate the process a bit by having a larger number of signing keys and then rotating the signing keys to get a distribution you can easily handle in case of a compromise. In a future release, we’ll have a revocation process were you can invalidate a single JWT by its unique JWT ID (JTI). For now a sledge hammer you have.

With greater security process, there’s greater complexity. With that said, `nsc` doesn’t track public or private signing keys. As these are only identities that when in use presume a manual use. That means that you the user will have to track and manage your private keys more closely.

Let’s get a feel for the workflow. We are going to:

- Create an operator with a signing key
- Create an account with a signing key
- The account will be signed using the operator’s signing key
- Create an user with the account’s signing key

All signing key operations revolve around the global `nsc` flag `-K` or `--private-key`. Whenever you want to modify an entity, you have to supply the parent key so that the JWT is signed. Normally this happens automatically but in the case of signing keys, you’ll have to supply the flag by hand.

Creating the operator:

```text
> nsc add operator -n O2
Generated operator key - private key stored "/Users/synadia/.nkeys/O2/O2.nk"
Success! - added operator "O2"

```

To add a signing key we have to first generate one with `nk`. `NSC` doesn’t at this time offer a way to generate keys that are not associated with an entity. This means that you will have to generate and store the secrets yourself:

```text
# generate an operator keypair:
> nk -gen operator -pubout
SOAIHSQSAM3ZJI5W6U5M4INH7FUCQQ5ETJ5RMPVJZCJLTDREY6ZNEE6LZQ
ODMYCI5TSZY6MFLOBBQ2RNRBRAXRKJKAC5UACRC6H6CJXCLR2STTGAAQ
```

> On a production environment private keys should be saved to a file and always referenced from the secured file.

Now we are going to edit the operator by adding a signing key with the `--sk` flag providing the generated operator public key (the one starting with `O`):

```text
> nsc edit operator --sk ODMYCI5TSZY6MFLOBBQ2RNRBRAXRKJKAC5UACRC6H6CJXCLR2STTGAAQ
Success! - edited operator
-----BEGIN NATS OPERATOR JWT-----
eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJPMk5BMkNaQ1ZINkQyTEVCQkNDVUFHTEZaWFJPTTdKTEs1Q1ZXRDZMVlpPVU9TUExDS0dBIiwiaWF0IjoxNTU2NTczNTYzLCJpc3MiOiJPQks3M09MUU9KV05ZVE4yTzQ2SVpRTjRXTVNDN0hWVk5BM1k2VFdQV0tDRlhJV1MzWExTQVVJUyIsIm5hbWUiOiJPMiIsInN1YiI6Ik9CSzczT0xRT0pXTllUTjJPNDZJWlFONFdNU0M3SFZWTkEzWTZUV1BXS0NGWElXUzNYTFNBVUlTIiwidHlwZSI6Im9wZXJhdG9yIiwibmF0cyI6eyJzaWduaW5nX2tleXMiOlsiT0RNWUNJNVRTWlk2TUZMT0JCUTJSTlJCUkFYUktKS0FDNVVBQ1JDNkg2Q0pYQ0xSMlNUVEdBQVEiXX19.-VNSZhmOa3TrGglTZ3pGU3BPScb0uj5rdvTHzzOyZ18_WlCBfo6H8S01S3D2qf9J36lKhPplMtupheYqEo04Aw
------END NATS OPERATOR JWT------
```

Check our handy work:

```text
> nsc describe operator
╭────────────────────────────────────────╮
│            Operator Details            │
├──────────────┬─────────────────────────┤
│ Name         │ O2                      │
│ Operator ID  │ OBK73OLQOJWN            │
│ Issuer ID    │ OBK73OLQOJWN            │
│ Issued       │ 2019-04-29 21:32:43 UTC │
│ Expires      │                         │
├──────────────┼─────────────────────────┤
│ Signing Keys │ ODMYCI5TSZY6            │
╰──────────────┴─────────────────────────╯
```

Now let’s create an account called `A` and sign it the generated operator private signing key. To sign it with the key specify the `-K` flag and the private key or a path to the private key:

```text
> nsc add account --name A -K SOAIHSQSAM3ZJI5W6U5M4INH7FUCQQ5ETJ5RMPVJZCJLTDREY6ZNEE6LZQ
Generated account key - private key stored "/Users/synadia/.nkeys/O2/accounts/A/A.nk"
Success! - added account "A"
```

Let’s generate an account signing key, again we use `nk`:

```text
> nk -gen account -pubout
SAAK3EL5BW4ZOR7JVTXZ4TJ6RQBSOIXK27AFPPSYVP4KDHJKSRQFVRAHIA
ABHYL27UAHHQXA5HLH2YWHFQBIP4YMPC7RNZ4PSFRAMJHSSZUUIXF2RV
```

Let’s add the signing key to the account, and remember to sign the account with the operator signing key:

```text
> nsc edit account --sk ABHYL27UAHHQXA5HLH2YWHFQBIP4YMPC7RNZ4PSFRAMJHSSZUUIXF2RV -K SOAIHSQSAM3ZJI5W6U5M4INH7FUCQQ5ETJ5RMPVJZCJLTDREY6ZNEE6LZQ 
Success! - edited account "A"


> nsc describe account 
╭─────────────────────────────────────────────────────╮
│                   Account Details                   │
├───────────────────────────┬─────────────────────────┤
│ Name                      │ A                       │
│ Account ID                │ AD7HDY5AS3LT            │
│ Issuer ID                 │ ODMYCI5TSZY6            │
│ Issued                    │ 2019-04-30 22:33:13 UTC │
│ Expires                   │                         │
├───────────────────────────┼─────────────────────────┤
│ Signing Keys              │ ABHYL27UAHHQ            │
├───────────────────────────┼─────────────────────────┤
│ Max Connections           │ Unlimited               │
│ Max Leaf Node Connections │ Unlimited               │
│ Max Data                  │ Unlimited               │
│ Max Exports               │ Unlimited               │
│ Max Imports               │ Unlimited               │
│ Max Msg Payload           │ Unlimited               │
│ Max Subscriptions         │ Unlimited               │
│ Exports Allows Wildcards  │ True                    │
├───────────────────────────┼─────────────────────────┤
│ Imports                   │ None                    │
│ Exports                   │ None                    │
╰───────────────────────────┴─────────────────────────╯
```

We can see that the signing key `ABHYL27UAHHQ` was added to the account. Also the issuer is the operator signing key (specified by the `-K`).

Now let’s create a user and signing it with account signing key starting with `ABHYL27UAHHQ`.

```text
> nsc add user --name U -K SAAK3EL5BW4ZOR7JVTXZ4TJ6RQBSOIXK27AFPPSYVP4KDHJKSRQFVRAHIA
Generated user key - private key stored "/Users/synadia/.nkeys/O2/accounts/A/users/U.nk"
Generated user creds file "/Users/synadia/.nkeys/O2/accounts/A/users/U.creds"
Success! - added user "U" to "A"

> nsc describe user
╭───────────────────────────────────────────╮
│                   User                    │
├─────────────────┬─────────────────────────┤
│ Name            │ U                       │
│ User ID         │ UDYKZHLXFH56            │
│ Issuer ID       │ ABHYL27UAHHQ            │
│ Issuer Account  │ AD7HDY5AS3LT            │
│ Issued          │ 2019-04-30 22:43:46 UTC │
│ Expires         │                         │
├─────────────────┼─────────────────────────┤
│ Max Messages    │ Unlimited               │
│ Max Msg Payload │ Unlimited               │
│ Network Src     │ Any                     │
│ Time            │ Any                     │
╰─────────────────┴─────────────────────────╯
```

As expected, the issuer is now the signing key we generated earlier. To map the user to the actual account, an `Issuer Account` field was added to the JWT that identifies the public key of account _A_.
