# Управление безопасностью NATS

Если вы используете [JWT](../configuration/securing_nats/jwt/) модель аутентификации для защиты инфраструктуры NATS или реализуете сервис [Auth callout](../../running-a-nats-service/configuration/securing_nats/auth_callout.md), вы можете администрировать аутентификацию и авторизацию без изменения конфигурационных файлов серверов.

Вы можете использовать CLI‑инструмент [`nsc`](../../using-nats/nats-tools/nsc/) для управления идентичностями. Идентичности представлены в виде nkeys. Nkeys — система цифровой подписи на публичных ключах на базе Ed25519 для экосистемы NATS. Идентичности nkey связаны с конфигурацией NATS в виде JSON Web Token (JWT). JWT цифрово подписывается приватным ключом издателя, формируя цепочку доверия. Инструмент `nsc` создает и управляет этими идентичностями и позволяет разворачивать их в JWT account server, который, в свою очередь, делает конфигурации доступными для nats‑server.

Также можно использовать CLI‑инструмент и библиотеку [`nk`](https://github.com/nats-io/nkeys#readme) для управления ключами.

## Программное создание, обновление и управление JWT

Создавать, обновлять и удалять аккаунты и пользователей программно можно с помощью следующих библиотек:

* Golang: см. [NKEYS](https://github.com/nats-io/nkeys) и [JWT](https://github.com/nats-io/jwt/tree/main/v2).
* Java: см. [NKey.java](https://github.com/nats-io/nats.java/blob/main/src/main/java/io/nats/client/NKey.java) и [JwtUtils.java](https://github.com/nats-io/nats.java/blob/main/src/main/java/io/nats/client/support/JwtUtils.java)

## Интеграция с вашей системой аутентификации/авторизации

Вы можете интегрировать NATS с вашей системой аутентификации/авторизации или создать собственную кастомную аутентификацию с помощью [Auth callout](../../running-a-nats-service/configuration/securing_nats/auth_callout.md).

### Примеры

См. [NATS by Example](https://natsbyexample.com/) в разделе "Authentication and Authorization" для примеров реализации JWT и Auth callout сервера.

#### JWT пользователей

[Создание пользователя в Golang](jwt.md#automated-sign-up-services---jwt-and-nkey-libraries)

#### JWT аккаунтов

Пример на Golang с https://natsbyexample.com/examples/auth/nkeys-jwts/go

```
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

### Примечания

Вы можете посмотреть ключ (и любые signing keys) вашего оператора командой `nsc list keys --show-seeds`. Для создания JWT аккаунтов следует использовать "signing key" (так как signing keys можно легко отзывать/ротацировать).

Для удаления аккаунтов используйте `"$SYS.REQ.CLAIMS.DELETE"` (см. [справку](jwt.md#subjects-available-when-using-nats-based-resolver)) и убедитесь, что включено удаление JWT в resolver `nats-server` (`config allow_delete: true` в блоке `resolver` конфигурации сервера).

Системный аккаунт — такой же аккаунт, как и остальные; разница лишь в том, что он указан как system account в JWT оператора (и в конфигурации сервера).
