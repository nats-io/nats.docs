# Отзыв

NATS поддерживает два типа отзывов. Оба хранятся в JWT аккаунта, чтобы nats-server мог видеть отзыв и применять его.

Пользователи отзываются по публичному ключу и времени. Доступ к экспорту, называемый activation, может быть отозван для конкретного аккаунта в определенный момент времени. Использование времени может быть запутанным, но оно рассчитано на основные сценарии отзыва.

Когда пользователь или activation отзывается в момент T, это означает, что любой user JWT или activation token, созданный до этого времени, недействителен. Если новый user JWT или новый activation token создан после T, его можно использовать. Это позволяет владельцу аккаунта отозвать пользователя и одновременно обновить его доступ.

Рассмотрим пример. Допустим, вы создали user JWT с доступом к subject "billing". Позже вы решаете, что пользователь не должен иметь доступ к "billing". Отзовите пользователя, например на полдень 1 мая 2019, и создайте новый user JWT без доступа к "billing". Пользователь больше не сможет войти со старым JWT, потому что он отозван, но сможет войти с новым JWT, потому что он создан после полудня 1 мая 2019.

`nsc` предоставляет команды для создания, удаления или просмотра отзывов:

```bash
nsc revocations -h
```
```text
Manage revocation for users and activations from an account

Usage:
  nsc revocations [command]

Available Commands:
  add-user          Revoke a user
  add_activation    Revoke an accounts access to an export
  delete-user       Remove a user revocation
  delete_activation Remove an account revocation from an export
  list-users        List users revoked in an account
  list_activations  List account revocations for an export

Flags:
  -h, --help   help for revocations

Global Flags:
  -i, --interactive          ask questions for various settings
  -K, --private-key string   private key

Use "nsc revocations [command] --help" for more information about a command.
```

Обе команды добавления принимают флаг `--at`, который по умолчанию равен 0 и может использоваться для задания unix timestamp, как описано выше. По умолчанию отзывы выставляются на текущее время, но вы можете установить время в прошлом, если знаете, когда произошла проблема и была устранена.

Удаление отзыва необратимо и может снова сделать действительными старые activation или user JWT. Поэтому удаление следует использовать только если вы уверены, что соответствующие токены истекли.

### Публикация изменений на nats servers

Если ваши nats servers настроены на использование встроенного NATS resolver, не забудьте «пушить» любые изменения аккаунта, сделанные локально с помощью `nsc revocations`, чтобы они вступили в силу на серверах.

Например: `nsc push -i` или `nsc push -a B -u nats://localhost`

Если есть клиенты, подключенные от имени пользователя, которого вы добавили в отзывы, их соединения будут немедленно завершены после того, как вы «пушите» отзывы на nats server.
