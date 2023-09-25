# Auth Callout

_As of NATS v2.10.0_

Auth Callout is an opt-in extension for delegating client authentication and authorization to an application-defined NATS service.

The motivation for this extension is to support applications using an alternate identity and access management (IAM) backend as the source of truth for managing users/applications/machines credentials and permissions, such as LDAP, SAML, and OAuth.

## Mental Model

[TODO image]

## Configuration

Centralized and decentralized authentication models are supported.

### Centralized Auth

{% hint style="warning" %}
Note, in this centralized model, existing users defined in the config file will be ignored. The auth service will need to handle authenticating all users as well as assigning the target account and permissions. This includes the system account user(s) and an implicit "no auth" user. See the [migrating](#migrating) section below for considerations when migrating to auth callout.
{% endhint %}

In the centralized config-based model, configuration is declared in the `auth_callout` block under thte top-level `authorization` block.

```
authorization {
    ...

    auth_callout {
        ...
    }
}
```

The available properties in the `auth_callout` block include:

| Property     | Description                                                                                                       |
| :----------- | :---------------------------------------------------------------------------------------------------------------- |
| `issuer`     | The public key of the designated NKey used for signing authorization payloads.                                    |
| `auth_users` | The list of user names under `account` that are designated auth callout users.                                    |
| `account`    | The account containing the users that are designated _auth callout_ users. Defaults to the global account (`$G`). |
| `xkey`       | Optional. The public key of a designated XKey (x25519) used for encrypting authorization payloads.                |

To generate the account issuer NKey, the [nsc](https://github.com/nats-io/nsc) tool can be used.

```
$ nsc generate nkey --account
SAANDLKMXL6CUS3CP52WIXBEDN6YJ545GDKC65U5JZPPV6WH6ESWUA6YAI
ABJHLOVMPA4CI6R5KLNGOB4GSLNIY7IOUPAJC4YFNDLQVIOBYQGUWVLA
```

{% hint type="warning" %}
☝️ Be sure to generate your own keypair! Don't use this in production.
{% endhint %}

The minimum configuration would use the implicit default account `$G`.

```
authorization {
  users: [ { user: auth, password: auth } ]
  auth_callout {
    issuer: ABJHLOVMPA4CI6R5KLNGOB4GSLNIY7IOUPAJC4YFNDLQVIOBYQGUWVLA
    auth_users: [ auth ]
  }
}
```

#### Multi-account

In practice, it is recommended to use multiple accounts in order to leverage the system account. Note, that the `account` property is now set to `AUTH` indicating where the `auth` user is defined.

```
accounts {
  AUTH: {
    users: [ { user: auth, password: auth } ]
  }
  APP: {}
  SYS: {}
}
system_account: SYS

authorization {
  auth_callout {
    issuer: ABJHLOVMPA4CI6R5KLNGOB4GSLNIY7IOUPAJC4YFNDLQVIOBYQGUWVLA
    auth_users: [ auth ]
    account: AUTH
  }
}
```

#### Encryption

The final optional property is `xkey` which is enables encrypting the request payloads. To generate an XKey, `nsc` can be used again.

```
$ nsc generate nkey --curve
SXANPB47UINQR7EXT3BRP26A4LY2CMCDLTY2KX6BU3EGK2VZYREJ4IJRCE
XAMHJVPKHHPYZQQM2IVWXKJH36KDDZZMSJ32QKSQBUODFX4I4HARO4GL
```

{% hint type="warning" %}
☝️ Again, don't use this and be sure to generate your own and keep the seed secret!
{% endhint %}

Incorporating the `xkey`, we have the following config:

```
accounts {
  AUTH: {
    users: [ { user: auth, password: auth } ]
  }
  APP: {}
  SYS: {}
}
system_account: SYS

authorization {
  auth_callout {
    issuer: ABJHLOVMPA4CI6R5KLNGOB4GSLNIY7IOUPAJC4YFNDLQVIOBYQGUWVLA
    auth_users: [ auth ]
    account: AUTH
    xkey: XAMHJVPKHHPYZQQM2IVWXKJH36KDDZZMSJ32QKSQBUODFX4I4HARO4GL
  }
}
```

The next step is [implementing a service](#service-implementation).

### Decentralized Auth

TODO

## Service implementation

The second requirement to leveraging auth callout is implementing the NATS service that authorization requests will be delegated to. The service subscribes to a fixed subject `$SYS.REQ.USER.AUTH` and must use one of designated _auth_ credentials.

The basic structure of a service looks as follows in Go:

```go
nc.QueueSubscribe("$SYS.REQ.USER.AUTH", "auth-callout", func(msg *nats.Msg) {
  // Decode the authorization request claims sent by the NATS server.
  reqClaims, _ := jwt.DecodeAuthorizationRequestClaims(string(msg.Data))

  // Application-defined function performing authentication and generate user claims.
  userClaims, err := authenticateAndGenerateClaims(reqClaims)

  // Prepare the authorization response payload.
  repData := encodeAuthResponse(reqClaims, userClaims, err)

  // Respond with the authorization response payload.
  msg.Respond(repData)
})
```

There are three key data structures:

- [authorization request claims](#authorization-request-claims)
- [authorization response claims](#authorization-response-claims)
- [user claims](#user-claims)

{% hint type="info" %}
Language support for these structures currently exists for Go in the [nats-io/jwt](https://pkg.go.dev/github.com/nats-io/jwt/v2) package.
{% endhint %}

### Authorization request claims

The claims is a standard JWT structure with a nested object named `nats` containing the following top-level fields:

- `server_id` - An object describing the NATS server, include the `id` field needed to be used in the authorization response.
- `user_nkey` - A user public NKey generated by the NATS server which is used as the _subject_ of the authorization response.
- `client_info` - An object describing the client attempting to connect.
- `connect_opts` - An object containing the data sent by client in the `CONNECT` message.
- `client_tls` - An object containing any client certificates, if applicable.

<details>
<summary>Full JSON schema</summary>
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "authorization-request-claims",
  "properties": {
    "aud": {
      "type": "string"
    },
    "exp": {
      "type": "integer"
    },
    "jti": {
      "type": "string"
    },
    "iat": {
      "type": "integer"
    },
    "iss": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "nbf": {
      "type": "integer"
    },
    "sub": {
      "type": "string"
    },
    "nats": {
      "properties": {
        "server_id": {
          "properties": {
            "name": {
              "type": "string"
            },
            "host": {
              "type": "string"
            },
            "id": {
              "type": "string"
            },
            "version": {
              "type": "string"
            },
            "cluster": {
              "type": "string"
            },
            "tags": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "xkey": {
              "type": "string"
            }
          },
          "additionalProperties": false,
          "type": "object",
          "required": [
            "name",
            "host",
            "id"
          ]
        },
        "user_nkey": {
          "type": "string"
        },
        "client_info": {
          "properties": {
            "host": {
              "type": "string"
            },
            "id": {
              "type": "integer"
            },
            "user": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "tags": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "name_tag": {
              "type": "string"
            },
            "kind": {
              "type": "string"
            },
            "type": {
              "type": "string"
            },
            "mqtt_id": {
              "type": "string"
            },
            "nonce": {
              "type": "string"
            }
          },
          "additionalProperties": false,
          "type": "object"
        },
        "connect_opts": {
          "properties": {
            "jwt": {
              "type": "string"
            },
            "nkey": {
              "type": "string"
            },
            "sig": {
              "type": "string"
            },
            "auth_token": {
              "type": "string"
            },
            "user": {
              "type": "string"
            },
            "pass": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "lang": {
              "type": "string"
            },
            "version": {
              "type": "string"
            },
            "protocol": {
              "type": "integer"
            }
          },
          "additionalProperties": false,
          "type": "object",
          "required": [
            "protocol"
          ]
        },
        "client_tls": {
          "properties": {
            "version": {
              "type": "string"
            },
            "cipher": {
              "type": "string"
            },
            "certs": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "verified_chains": {
              "items": {
                "items": {
                  "type": "string"
                },
                "type": "array"
              },
              "type": "array"
            }
          },
          "additionalProperties": false,
          "type": "object"
        },
        "request_nonce": {
          "type": "string"
        },
        "tags": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "type": {
          "type": "string"
        },
        "version": {
          "type": "integer"
        }
      },
      "additionalProperties": false,
      "type": "object",
      "required": [
        "server_id",
        "user_nkey",
        "client_info",
        "connect_opts"
      ]
    }
  },
  "additionalProperties": false,
  "type": "object",
  "required": [
    "nats"
  ]
}
```
</details>

### Authorization response claims

The claims is a standard JWT structure with a nested object named `nats` containing the following top-level fields:

- `jwt` - The encoded [user claims](#user-claims) JWT which will be used by the NATS server for the duration of the client connection.
- `error` - An error message sent back to the NATS server if authorization failed. This will be included log output.
- `issuer_account` - The public Nkey of the issuing account. If set, this indicates the claim was issued by a signing key.

<details>
<summary>Full JSON schema</summary>
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://github.com/nats-io/jwt/v2/authorization-response-claims",
  "properties": {
    "aud": {
      "type": "string"
    },
    "exp": {
      "type": "integer"
    },
    "jti": {
      "type": "string"
    },
    "iat": {
      "type": "integer"
    },
    "iss": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "nbf": {
      "type": "integer"
    },
    "sub": {
      "type": "string"
    },
    "nats": {
      "properties": {
        "jwt": {
          "type": "string"
        },
        "error": {
          "type": "string"
        },
        "issuer_account": {
          "type": "string"
        },
        "tags": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "type": {
          "type": "string"
        },
        "version": {
          "type": "integer"
        }
      },
      "additionalProperties": false,
      "type": "object"
    }
  },
  "additionalProperties": false,
  "type": "object",
  "required": [
    "nats"
  ]
}
```
</details>

### User claims

The claims is a standard JWT structure with a nested object named `nats` containing the following, notable, top-level fields:

- `issuer_account` - The public Nkey of the issuing account. If set, this indicates the claim was issued by a signing key.

<details>
<summary>Full JSON schema</summary>
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://github.com/nats-io/jwt/v2/user-claims",
  "properties": {
    "aud": {
      "type": "string"
    },
    "exp": {
      "type": "integer"
    },
    "jti": {
      "type": "string"
    },
    "iat": {
      "type": "integer"
    },
    "iss": {
      "type": "string"
    },
    "name": {
      "type": "string"
    },
    "nbf": {
      "type": "integer"
    },
    "sub": {
      "type": "string"
    },
    "nats": {
      "properties": {
        "pub": {
          "properties": {
            "allow": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "deny": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "additionalProperties": false,
          "type": "object"
        },
        "sub": {
          "properties": {
            "allow": {
              "items": {
                "type": "string"
              },
              "type": "array"
            },
            "deny": {
              "items": {
                "type": "string"
              },
              "type": "array"
            }
          },
          "additionalProperties": false,
          "type": "object"
        },
        "resp": {
          "properties": {
            "max": {
              "type": "integer"
            },
            "ttl": {
              "type": "integer"
            }
          },
          "additionalProperties": false,
          "type": "object",
          "required": [
            "max",
            "ttl"
          ]
        },
        "src": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "times": {
          "items": {
            "properties": {
              "start": {
                "type": "string"
              },
              "end": {
                "type": "string"
              }
            },
            "additionalProperties": false,
            "type": "object"
          },
          "type": "array"
        },
        "times_location": {
          "type": "string"
        },
        "subs": {
          "type": "integer"
        },
        "data": {
          "type": "integer"
        },
        "payload": {
          "type": "integer"
        },
        "bearer_token": {
          "type": "boolean"
        },
        "allowed_connection_types": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "issuer_account": {
          "type": "string"
        },
        "tags": {
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "type": {
          "type": "string"
        },
        "version": {
          "type": "integer"
        }
      },
      "additionalProperties": false,
      "type": "object"
    }
  },
  "additionalProperties": false,
  "type": "object"
}
```
</details>

Note, when a user is authorized by the service, the `$SYS.REQ.USER.AUTH` subject will be automatically added to the deny-list for subscription permissions.

### Examples

Two reference examples are available on NATS by Example:

- [Centralized Auth](https://natsbyexample.com/examples/auth/callout/cli)
- [Decentralized Auth](https://natsbyexample.com/examples/auth/callout-decentralized/cli)

## Migrating

In this context, migration refers to the considerations and ordered steps to enable auth callout for an existing system without interruption.

### Centralized Auth

As noted in the [configuration section](#centralized-auth), enabling `auth_callout` will result in the existing users and permissions defined in the configuration to be inactive. As a result, prior to changing the configuration, the service must be implemented and users and permissions ported to the desired backend. Once the service is deployed, the `auth_callout` configuration can be enabled at which point client authentication will be delegated to the auth service. Assuming the credentials are the same, clients should not experience interruption on reconnect.

### Decentralized Auth

TODO
