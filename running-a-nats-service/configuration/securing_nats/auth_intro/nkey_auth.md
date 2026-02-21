# NKeys

NKeys — это новая высокозащищенная система подписей на основе публичных ключей, основанная на [Ed25519](https://ed25519.cr.yp.to/).

С NKeys сервер может проверять личности, не храня и даже не видя приватные ключи. Система аутентификации требует, чтобы подключающийся клиент предоставил свой публичный ключ и цифровой подписью подтвердил challenge своим приватным ключом. Сервер генерирует случайный challenge при каждом запросе подключения, что делает его устойчивым к атакам повторного воспроизведения. Сгенерированная подпись проверяется по предоставленному публичному ключу, тем самым доказывая личность клиента. Если публичный ключ известен серверу, аутентификация успешна.

> NKey — отличная замена token‑аутентификации, потому что подключающийся клиент должен доказать, что он контролирует приватный ключ для авторизованного публичного ключа.

Чтобы генерировать nkeys, нужен инструмент [`nk`](../../../../using-nats/nats-tools/nk.md).

## Генерация NKeys и настройка сервера

Чтобы сгенерировать _User_ NKEY:

```shell
nk -gen user -pubout
```
```text
SUACSSL3UAHUDXKFSNVUZRF5UHPMWZ6BFDTJ7M6USDXIEDNPPQYYYCU3VY
UDXU4RCSJNZOIQHZNWXHXORDPRTGNJAHAHFRGZNEEJCPQTT2M7NLCNF4
```

Первая строка вывода начинается с буквы `S` (Seed). Вторая буква `U` означает _User_. Seeds — это приватные ключи; храните их как секреты и берегите.

Вторая строка начинается с буквы `U` (User) и является публичным ключом, который можно безопасно распространять.

Чтобы использовать nkey‑аутентификацию, добавьте пользователя и установите свойство `nkey` в публичный ключ пользователя, которого хотите аутентифицировать:

```text
authorization: {
  users: [
    { nkey: UDXU4RCSJNZOIQHZNWXHXORDPRTGNJAHAHFRGZNEEJCPQTT2M7NLCNF4 }
  ]
}
```

Обратите внимание: в секции пользователя задается свойство `nkey` (параметры user/password/token не нужны). Добавляйте разделы `permission` по мере необходимости.

## Конфигурация клиента

Теперь, когда у вас есть пользовательский nkey, настроим [клиент](../../../../using-nats/developing-with-nats/connecting/security/nkey.md) на его использование для аутентификации. Пример опций подключения для node‑клиента:

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

Клиент предоставляет функцию, которая использует seed (приватный ключ) для подписи challenge подключения.
