# NKeys

NKeys are a new, highly secure public-key signature system based on [Ed25519](https://ed25519.cr.yp.to/).

With NKeys the server can verify identities without ever storing or ever seeing private keys. The authentication system works by requiring a connecting client to provide its public key and digitally sign a challenge with its private key. The server generates a random challenge with every connection request, making it immune to playback attacks. The generated signature is validated against the provided public key, thus proving the identity of the client. If the public key is known to the server, authentication succeeds.

> NKey is an excellent replacement for token authentication because a connecting client will have to prove it controls the private key for the authorized public key.

To generate nkeys, you'll need the [`nk` tool](../../../../nats-tools/nk.md).

## Generating NKeys and Configuring the Server

To generate a _User_ NKEY:

```text
> nk -gen user -pubout
SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY
UDXU4RCSJNZOIQHZNWXHXORDPRTGNJAHAHFRGZNEEJCPQTT2M7NLCNF4
```

The first output line starts with the letter `S` for _Seed_. The second letter, `U` stands for _User_. Seeds are private keys; you should treat them as secrets and guard them with care.

The second line starts with the letter `U` for _User_ and is a public key which can be safely shared.

To use nkey authentication, add a user, and set the `nkey` property to the public key of the user you want to authenticate:

```text
authorization: {
  users: [
    { nkey: UDXU4RCSJNZOIQHZNWXHXORDPRTGNJAHAHFRGZNEEJCPQTT2M7NLCNF4 }
  ]
}
```

Note that the user section sets the `nkey` property \(user/password/token properties are not needed\). Add `permission` sections as required.

## Client Configuration

Now that you have a user nkey, let's configure a client to use it for authentication. As an example, here are the connect options for the node client:

```javascript
const NATS = require('nats');
const nkeys = require('ts-nkeys');

const nkey_seed = ‘SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY’;
const nc = NATS.connect({
  port: PORT,
  nkey: 'UDXU4RCSJNZOIQHZNWXHXORDPRTGNJAHAHFRGZNEEJCPQTT2M7NLCNF4',
  sigCB: function (nonce) {
    // client loads seed safely from a file
    // or some constant like `nkey_seed` defined in
    // the program
    const sk = nkeys.fromSeed(Buffer.from(nkey_seed));
    return sk.sign(nonce);
   }
});
...
```

The client provides a function that it uses to parse the seed \(the private key\) and sign the connection challenge.

## Mixing NKEYS and Trusted Operator setup in NATS v2

Mixing both nkeys static config and trusted operator setup (decentralized auth model) is possible
but needs some preparation in order to be able to do it.

The way this can be done is by **first** preparing a basic trusted operator setup
that could be used in the future, and then base from that configuration to create the
NKEYS static config using the same shared public nkeys for the accounts and then use
clustering routes to bridge the two different auth setups during the transition.

For example, creating the following initial setup using [NSC](/nsc/readme.md):

```sh
        nsc add account --name SYS
        nsc add user    --name sys
        nsc add account --name A
        nsc add user -a A --name test
        nsc add account --name B
        nsc add user -a B --name test
```

This will then generate something like the following:

```sh
 nsc list accounts
╭─────────────────────────────────────────────────────────────────╮
│                            Accounts                             │
├──────┬──────────────────────────────────────────────────────────┤
│ Name │ Public Key                                               │
├──────┼──────────────────────────────────────────────────────────┤
│ A    │ ADFB2JXYTXOJEL6LNAXDREUGRX35BOLZI3B4PFFAC7IRPR3OA4QNKBN2 │
│ B    │ ACWOMQA7PZTKJSBTR7BF6TBK3D776734PWHWDKO7HFMQOM5BIOYPSYZZ │
│ SYS  │ ABKOWIYVTHNEK5HELPWLAT2CF2CUPELIK4SZH2VCJHLFU22B5U2IIZUO │
╰──────┴──────────────────────────────────────────────────────────╯

 nsc list users -a A
╭─────────────────────────────────────────────────────────────────╮
│                              Users                              │
├──────┬──────────────────────────────────────────────────────────┤
│ Name │ Public Key                                               │
├──────┼──────────────────────────────────────────────────────────┤
│ test │ UAPOK2P7EN3UFBL7SBJPQK3M3JMLALYRYKX5XWSVMVYK63ZMBHTOHVJR │
╰──────┴──────────────────────────────────────────────────────────╯
```

We could use this configuration as the initial starting configuration for an nkeys config now,
where all the NKEYS users public nkeys are explicitly listed (centralized auth model).

```hcl
port = 4222

cluster {
  port = 6222
  
  # We will bridge two different servers with different auth models via routes
  # routes [ nats://127.0.0.1:6223 ]
}

system_account = ABKOWIYVTHNEK5HELPWLAT2CF2CUPELIK4SZH2VCJHLFU22B5U2IIZUO

accounts {
  # Account A
  ADFB2JXYTXOJEL6LNAXDREUGRX35BOLZI3B4PFFAC7IRPR3OA4QNKBN2 {
    nkey: ADFB2JXYTXOJEL6LNAXDREUGRX35BOLZI3B4PFFAC7IRPR3OA4QNKBN2
    users = [
      {nkey: "UAPOK2P7EN3UFBL7SBJPQK3M3JMLALYRYKX5XWSVMVYK63ZMBHTOHVJR" }
    ]
  }

  # Account B
  ACWOMQA7PZTKJSBTR7BF6TBK3D776734PWHWDKO7HFMQOM5BIOYPSYZZ {
  }

  # Account SYS
  ABKOWIYVTHNEK5HELPWLAT2CF2CUPELIK4SZH2VCJHLFU22B5U2IIZUO {
  }
}
```


By using `nsc` it is possible to create a mem based resolver for the trusted operator setup:

```
nsc generate config --mem-resolver --sys-account SYS
```

An example configuration from the second node with the trusted operator setup could then be:

```hcl
port = 4223

cluster {
  port = 6223
  routes [ nats://127.0.0.1:6222 ]
}

# debug = true
# trace = true

# Operator
operator = eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJQNDJBSkFTVVA0TUdGRU1EQzVCRVVGUkM1MlQ1M05OTzRIWkhRNEdETVk0S0RZTFVRV0JBIiwiaWF0IjoxNTc0Mzc1OTE2LCJpc3MiOiJPQ09KSk5aSUNINkNHUU5LM1NRMzVXTFpXWkpDUkRBTFJIWjZPVzQ0RFpZVVdNVVYzV1BSSEZSRCIsIm5hbWUiOiJLTyIsInN1YiI6Ik9DT0pKTlpJQ0g2Q0dRTkszU1EzNVdMWldaSkNSREFMUkhaNk9XNDREWllVV01VVjNXUFJIRlJEIiwidHlwZSI6Im9wZXJhdG9yIiwibmF0cyI6e319.pppa9-xhWXJLSCCtqj_dqlvXKR7WlVCh0cqoZ6lr8zg3WlWM8U0bNf6FHw_67-wRS7jj0n4PuA0P0MAJdE3pDA

system_account = ABKOWIYVTHNEK5HELPWLAT2CF2CUPELIK4SZH2VCJHLFU22B5U2IIZUO

resolver = MEMORY

resolver_preload = {
  # Account "A"
  ADFB2JXYTXOJEL6LNAXDREUGRX35BOLZI3B4PFFAC7IRPR3OA4QNKBN2: eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiIyQjNYNUJPQzQ3M05TU0hFWUVHTzJYRUhaTVNGRVBORFFBREJXWkJLRVdQVlg2TUlZU1JRIiwiaWF0IjoxNTc0Mzc1OTE2LCJpc3MiOiJPQ09KSk5aSUNINkNHUU5LM1NRMzVXTFpXWkpDUkRBTFJIWjZPVzQ0RFpZVVdNVVYzV1BSSEZSRCIsIm5hbWUiOiJBIiwic3ViIjoiQURGQjJKWFlUWE9KRUw2TE5BWERSRVVHUlgzNUJPTFpJM0I0UEZGQUM3SVJQUjNPQTRRTktCTjIiLCJ0eXBlIjoiYWNjb3VudCIsIm5hdHMiOnsiZXhwb3J0cyI6W3sibmFtZSI6InRlc3QiLCJzdWJqZWN0IjoidGVzdCIsInR5cGUiOiJzZXJ2aWNlIiwic2VydmljZV9sYXRlbmN5Ijp7InNhbXBsaW5nIjoxMDAsInJlc3VsdHMiOiJsYXRlbmN5Lm9uLnRlc3QifX1dLCJsaW1pdHMiOnsic3VicyI6LTEsImNvbm4iOi0xLCJsZWFmIjotMSwiaW1wb3J0cyI6LTEsImV4cG9ydHMiOi0xLCJkYXRhIjotMSwicGF5bG9hZCI6LTEsIndpbGRjYXJkcyI6dHJ1ZX19fQ.zZBetgDN6nCFDVpwzF_124BPkc8amGPDnrOmiKUa12xski5zskUI0Y0OeIa1vTo0bkHIKTgM2QDYpmXUQOHnAQ

  # Account "B"
  ACWOMQA7PZTKJSBTR7BF6TBK3D776734PWHWDKO7HFMQOM5BIOYPSYZZ: eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJBTFNFQkZGWDZMR0pQTlVMU1NXTDNTRTNISkk2WUZSWlVKSDNLV0E1VE41WUtWRE5MVTJRIiwiaWF0IjoxNTc0Mzc1OTE2LCJpc3MiOiJPQ09KSk5aSUNINkNHUU5LM1NRMzVXTFpXWkpDUkRBTFJIWjZPVzQ0RFpZVVdNVVYzV1BSSEZSRCIsIm5hbWUiOiJCIiwic3ViIjoiQUNXT01RQTdQWlRLSlNCVFI3QkY2VEJLM0Q3NzY3MzRQV0hXREtPN0hGTVFPTTVCSU9ZUFNZWloiLCJ0eXBlIjoiYWNjb3VudCIsIm5hdHMiOnsiaW1wb3J0cyI6W3sibmFtZSI6InRlc3QiLCJzdWJqZWN0IjoidGVzdCIsImFjY291bnQiOiJBREZCMkpYWVRYT0pFTDZMTkFYRFJFVUdSWDM1Qk9MWkkzQjRQRkZBQzdJUlBSM09BNFFOS0JOMiIsInRvIjoidGVzdCIsInR5cGUiOiJzZXJ2aWNlIn1dLCJsaW1pdHMiOnsic3VicyI6LTEsImNvbm4iOi0xLCJsZWFmIjotMSwiaW1wb3J0cyI6LTEsImV4cG9ydHMiOi0xLCJkYXRhIjotMSwicGF5bG9hZCI6LTEsIndpbGRjYXJkcyI6dHJ1ZX19fQ.AnzziBwt5Tnphc2prONUUOpMpkkAlJHvCPaag0GUtTYPCHKDphcJrwtAHi4v5NOI6npjoes0F0MlrfnHqidDAg

  # Account "SYS"
  ABKOWIYVTHNEK5HELPWLAT2CF2CUPELIK4SZH2VCJHLFU22B5U2IIZUO: eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiI1WVUyWkc1UkRTSU1TN1pGVE1MU0NZQUtLVkVFWUpPUlc0TDJPTlY3N1g1TlJZWkFGSkRRIiwiaWF0IjoxNTc0Mzc1OTE2LCJpc3MiOiJPQ09KSk5aSUNINkNHUU5LM1NRMzVXTFpXWkpDUkRBTFJIWjZPVzQ0RFpZVVdNVVYzV1BSSEZSRCIsIm5hbWUiOiJTWVMiLCJzdWIiOiJBQktPV0lZVlRITkVLNUhFTFBXTEFUMkNGMkNVUEVMSUs0U1pIMlZDSkhMRlUyMkI1VTJJSVpVTyIsInR5cGUiOiJhY2NvdW50IiwibmF0cyI6eyJsaW1pdHMiOnsic3VicyI6LTEsImNvbm4iOi0xLCJsZWFmIjotMSwiaW1wb3J0cyI6LTEsImV4cG9ydHMiOi0xLCJkYXRhIjotMSwicGF5bG9hZCI6LTEsIndpbGRjYXJkcyI6dHJ1ZX19fQ.5FrO4sZbWuFgRLuy7c1eQLUq_BQ4PNhIAN5A-sRLkYWmvlc4c_Y4VfTbgl5zhNzCxfvj9SxT7ySgphup2BiRAA
}
```

Even though they have different authorization mechanisms, these two servers are able to route account messages because they share the same NKEY. 

We have created at least one user, in this case with creds:

```conf
-----BEGIN NATS USER JWT-----
eyJ0eXAiOiJqd3QiLCJhbGciOiJlZDI1NTE5In0.eyJqdGkiOiJNRkM3V1E1N0hKUE9aWUVOTEhVRTZTWFVQTDVKTURWSkxIQzJRTkpYNUVJS0RGR1U1REhRIiwiaWF0IjoxNTc0Mzc1OTE2LCJpc3MiOiJBREZCMkpYWVRYT0pFTDZMTkFYRFJFVUdSWDM1Qk9MWkkzQjRQRkZBQzdJUlBSM09BNFFOS0JOMiIsIm5hbWUiOiJ0ZXN0Iiwic3ViIjoiVUFQT0syUDdFTjNVRkJMN1NCSlBRSzNNM0pNTEFMWVJZS1g1WFdTVk1WWUs2M1pNQkhUT0hWSlIiLCJ0eXBlIjoidXNlciIsIm5hdHMiOnsicHViIjp7ImFsbG93IjpbIl9JTkJPWC5cdTAwM2UiLCJfUl8iLCJfUl8uXHUwMDNlIiwidGVzdCIsInRlc3QuXHUwMDNlIl19LCJzdWIiOnsiYWxsb3ciOlsiX0lOQk9YLlx1MDAzZSIsIl9SXyIsIl9SXy5cdTAwM2UiLCJsYXRlbmN5Lm9uLnRlc3QiLCJ0ZXN0IiwidGVzdC5cdTAwM2UiXX19fQ.MSU2aUIBK1iUsg7h52lLrfEfTwVMF_wB3HDq75ECskxSyyDDMtk9_3957UtQF-3yoGCIhKOkWjzX8C-WXnLADw
------END NATS USER JWT------
************************* IMPORTANT *************************
NKEY Seed printed below can be used to sign and prove identity.
NKEYs are sensitive and should be treated as secrets.
-----BEGIN USER NKEY SEED-----
SUANVBWRHHFMGHNIT6UJHPN2TGVBVIILE7VPVNEQ7DGCJ26ZD2V3KAHT4M
------END USER NKEY SEED------
*************************************************************
```

And this same user is able to connect to either one of the servers (bound to 4222 and 4223 respectively):

Subscriber Service:

```go
package main

import (
	"log"

	"github.com/nats-io/nats.go"
)

func main() {
	opts := make([]nats.Option, 0)

	// Extract public nkey from seed
	//
	// Public:  UAPOK2P7EN3UFBL7SBJPQK3M3JMLALYRYKX5XWSVMVYK63ZMBHTOHVJR
	// Private: SUANVBWRHHFMGHNIT6UJHPN2TGVBVIILE7VPVNEQ7DGCJ26ZD2V3KAHT4M
	// 
	nkey, err := nats.NkeyOptionFromSeed("path/to/seed.nkey")
	if err != nil {
		log.Fatal(err)
	}
	opts = append(opts, nkey)
	nc, err := nats.Connect("127.0.0.1:4222", opts...)
	if err != nil {
		log.Fatal(err)
	}
	nc.Subscribe("test", func(m *nats.Msg){
		log.Printf("[Received] %q, replying... \n", string(m.Data))
		m.Respond([]byte("pong from nkeys based server"))
	})

	select {}
}
```

Requestor:

```go
package main

import (
	"log"
	"time"

	"github.com/nats-io/nats.go"
)

func main() {
	nc, err := nats.Connect("127.0.0.1:4223", nats.UserCredentials("path/to/user.creds"))
	if err != nil {
		log.Fatal(err)
	}

	for range time.NewTicker(1 * time.Second).C {
		resp, err := nc.Request("test", []byte("test"), 1*time.Second)
		if err != nil {
			log.Println("[Error]", err)
			continue
		}
		log.Println("[Received]", string(resp.Data))
	}
}
```