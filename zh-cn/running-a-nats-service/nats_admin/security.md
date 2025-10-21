# 管理 NATS 安全性

如果您使用 [JWT](../configuration/securing_nats/jwt/) 认证模型来保护您的 NATS 基础设施，或者实现一个 [认证回调](../../running-a-nats-service/configuration/securing_nats/auth_callout.md) 服务，您无需修改服务器的配置文件即可管理身份验证和授权。

您可以使用 [`nsc`](../../using-nats/nats-tools/nsc/) CLI 工具来管理身份。身份采用 nkey 的形式。nkey 是一种基于 Ed25519 的公钥签名系统，为 NATS 生态系统打造。nkey 身份与 NATS 配置以 JSON Web Token (JWT) 的形式相关联。JWT 由颁发者的私钥进行数字签名，形成信任链。nsc 工具用于创建和管理这些身份，并允许您将它们部署到 JWT 账户服务器上，该服务器再将配置提供给 nats-servers。

您也可以使用 [`nk`](https://github.com/nats-io/nkeys#readme) CLI 工具和库来管理密钥。

## 通过编程方式创建、更新和管理 JWT

您可以使用以下库以编程方式创建、更新和删除账户和用户：

* Golang：参见 [NKEYS](https://github.com/nats-io/nkeys) 和 [JWT](https://github.com/nats-io/jwt/tree/main/v2)。
* Java：参见 [NKey.java](https://github.com/nats-io/nats.java/blob/main/src/main/java/io/nats/client/NKey.java) 和 [JwtUtils.java](https://github.com/nats-io/nats.java/blob/main/src/main/java/io/nats/client/support/JwtUtils.java)。

## 与现有身份验证/授权系统的集成

您可以将 NATS 与现有的身份验证/授权系统集成，或使用 [认证回调](../../running-a-nats-service/configuration/securing_nats/auth_callout.md) 创建自定义的身份验证。

### 示例

请参阅 [NATS by Example](https://natsbyexample.com/) 中“身份验证和授权”部分，查看 JWT 和认证回调服务器的实现示例。

#### 用户 JWT

[Golang 中的用户创建](jwt.md#automated-sign-up-services---jwt-and-nkey-libraries)

#### 账户 JWT

来自 https://natsbyexample.com/examples/auth/nkeys-jwts/go 的 Golang 示例

```go
package main

import (
	"flag"
	"fmt"
	"log"

	"github.com/nats-io/jwt/v2"
	"github.com/nats-io/nkeys"
)

func main() {
	log.SetFlags(0)

	var (
		accountSeed  string
		operatorSeed string
		name         string
	)

	flag.StringVar(&operatorSeed, "operator", "", "Operator seed for creating an account.")
	flag.StringVar(&accountSeed, "account", "", "Account seed for creating a user.")
	flag.StringVar(&name, "name", "", "Account or user name to be created.")

	flag.Parse()

	if accountSeed != "" && operatorSeed != "" {
		log.Fatal("operator and account cannot both be provided")
	}

	var (
		jwt string
		err error
	)

	if operatorSeed != "" {
		jwt, err = createAccount(operatorSeed, name)
	} else if accountSeed != "" {
		jwt, err = createUser(accountSeed, name)
	} else {
		flag.PrintDefaults()
		return
	}
	if err != nil {
		log.Fatalf("error creating account JWT: %v", err)
	}

	fmt.Println(jwt)
}

func createAccount(operatorSeed, accountName string) (string, error) {
	akp, err := nkeys.CreateAccount()
	if err != nil {
		return "", fmt.Errorf("unable to create account using nkeys: %w", err)
	}

	apub, err := akp.PublicKey()
	if err != nil {
		return "", fmt.Errorf("unable to retrieve public key: %w", err)
	}

	ac := jwt.NewAccountClaims(apub)
	ac.Name = accountName

	// Load operator key pair
	okp, err := nkeys.FromSeed([]byte(operatorSeed))
	if err != nil {
		return "", fmt.Errorf("unable to create operator key pair from seed: %w", err)
	}

	// Sign the account claims and convert it into a JWT string
	ajwt, err := ac.Encode(okp)
	if err != nil {
		return "", fmt.Errorf("unable to sign the claims: %w", err)
	}

	return ajwt, nil
}

func createUser(accountSeed, userName string) (string, error) {
	ukp, err := nkeys.CreateUser()
	if err != nil {
		return "", fmt.Errorf("unable to create user using nkeys: %w", err)
	}

	upub, err := ukp.PublicKey()
	if err != nil {
		return "", fmt.Errorf("unable to retrieve public key: %w", err)
	}

	uc := jwt.NewUserClaims(upub)
	uc.Name = userName

	// Load account key pair
	akp, err := nkeys.FromSeed([]byte(accountSeed))
	if err != nil {
		return "", fmt.Errorf("unable to create account key pair from seed: %w", err)
	}

	// Sign the user claims and convert it into a JWT string
	ujwt, err := uc.Encode(akp)
	if err != nil {
		return "", fmt.Errorf("unable to sign the claims: %w", err)
	}

	return ujwt, nil
}
```

### 注意事项

您可以使用 `nsc list keys --show-seeds` 查看运营方的密钥（以及任何签名密钥），您应使用“签名密钥”来创建账户 JWT（因为签名密钥可以轻松撤销或轮换）。

要删除账户，请使用 `$SYS.REQ.CLAIMS.DELETE`（参见 [参考](jwt.md#subjects-available-when-using-nats-based-resolver)），并确保在 nats-server 解析器中启用 JWT 删除功能（在服务器配置的 `resolver` 段中设置 `config allow_delete: true`）。

该系统与任何其他账户类似，唯一的区别是它在运营方的 JWT（以及服务器配置）中被列为系统账户。