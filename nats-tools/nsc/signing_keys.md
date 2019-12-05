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

```bash
> nsc add operator O2
[ OK ] generated and stored operator key "OABX3STBZZRBHMWMIMVHNQVNUG2O3D54BMZXX5LMBYKSAPDSHIWPMMFY"
[ OK ] added operator "O2"
```

To add a signing key we have to first generate one with `nsc`:

```bash
> nsc generate nkey --operator --store
SOAEW6Z4HCCGSLZJYZQMGFQY2SY6ZKOPIAKUQ5VZY6CW23WWYRNHTQWVOA
OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5
operator key stored ~/.nkeys/keys/O/AZ/OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5.nk
```

> On a production environment private keys should be saved to a file and always referenced from the secured file.

Now we are going to edit the operator by adding a signing key with the `--sk` flag providing the generated operator public key (the one starting with `O`):

```text
> nsc edit operator --sk OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5
[ OK ] added signing key "OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5"
[ OK ] edited operator "O2"
```

Check our handy work:

```text
> nsc describe operator
╭─────────────────────────────────────────────────────────────────────────╮
│                            Operator Details                             │
├──────────────┬──────────────────────────────────────────────────────────┤
│ Name         │ O2                                                       │
│ Operator ID  │ OABX3STBZZRBHMWMIMVHNQVNUG2O3D54BMZXX5LMBYKSAPDSHIWPMMFY │
│ Issuer ID    │ OABX3STBZZRBHMWMIMVHNQVNUG2O3D54BMZXX5LMBYKSAPDSHIWPMMFY │
│ Issued       │ 2019-12-05 14:36:16 UTC                                  │
│ Expires      │                                                          │
├──────────────┼──────────────────────────────────────────────────────────┤
│ Signing Keys │ OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5 │
╰──────────────┴──────────────────────────────────────────────────────────╯
```

Now let’s create an account called `A` and sign it the generated operator private signing key. To sign it with the key specify the `-K` flag and the private key or a path to the private key:

```text
> nsc add account A -K ~/.nkeys/keys/O/AZ/OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5.nk 
[ OK ] generated and stored account key "ACDXQQ6KD5MVSFMK7GNF5ARK3OJC6PEICWCH5PQ7HO27VKGCXQHFE33B"
[ OK ] added account "A"
```

Let’s generate an account signing key, again we use `nk`:

```text
> nsc generate nkey --account --store 
SAAA4BVFTJMBOW3GAYB3STG3VWFSR4TP4QJKG2OCECGA26SKONPFGC4HHE
ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7
account key stored ~/.nkeys/keys/A/DU/ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7.nk
```

Let’s add the signing key to the account, and remember to sign the account with the operator signing key:

```text
> nsc edit account --sk ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7 -K ~/.nkeys/keys/O/AZ/OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5.nk 
[ OK ] added signing key "ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7"
[ OK ] edited account "A"


> nsc describe account 
╭──────────────────────────────────────────────────────────────────────────────────────╮
│                                   Account Details                                    │
├───────────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                      │ A                                                        │
│ Account ID                │ ACDXQQ6KD5MVSFMK7GNF5ARK3OJC6PEICWCH5PQ7HO27VKGCXQHFE33B │
│ Issuer ID                 │ OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5 │
│ Issued                    │ 2019-12-05 14:48:22 UTC                                  │
│ Expires                   │                                                          │
├───────────────────────────┼──────────────────────────────────────────────────────────┤
│ Signing Keys              │ ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7 │
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
│ Exports                   │ None                                                     │
╰───────────────────────────┴──────────────────────────────────────────────────────────╯
```

We can see that the signing key `ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7` was added to the account. Also the issuer is the operator signing key (specified by the `-K`).

Now let’s create a user and signing it with account signing key starting with `ABHYL27UAHHQ`.

```text
> nsc add user U -K ~/.nkeys/keys/A/DU/ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7.nk
[ OK ] generated and stored user key "UD47TOTKVDY4IQRGI6D7XMLZPHZVNV5FCD4CNQICLV3FXLQBY72A4UXL"
[ OK ] generated user creds file "~/.nkeys/creds/O2/A/U.creds"
[ OK ] added user "U" to account "A"

> nsc describe user
╭─────────────────────────────────────────────────────────────────────────────────╮
│                                      User                                       │
├──────────────────────┬──────────────────────────────────────────────────────────┤
│ Name                 │ U                                                        │
│ User ID              │ UD47TOTKVDY4IQRGI6D7XMLZPHZVNV5FCD4CNQICLV3FXLQBY72A4UXL │
│ Issuer ID            │ ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7 │
│ Issuer Account       │ ACDXQQ6KD5MVSFMK7GNF5ARK3OJC6PEICWCH5PQ7HO27VKGCXQHFE33B │
│ Issued               │ 2019-12-05 14:50:07 UTC                                  │
│ Expires              │                                                          │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ Response Permissions │ Not Set                                                  │
├──────────────────────┼──────────────────────────────────────────────────────────┤
│ Max Messages         │ Unlimited                                                │
│ Max Msg Payload      │ Unlimited                                                │
│ Network Src          │ Any                                                      │
│ Time                 │ Any                                                      │
╰──────────────────────┴──────────────────────────────────────────────────────────╯
```

As expected, the issuer is now the signing key we generated earlier. To map the user to the actual account, an `Issuer Account` field was added to the JWT that identifies the public key of account _A_.
