# Username/Password

## Пароли в открытом виде

Вы можете аутентифицировать одного или нескольких клиентов по username/password; это дает более тонкий контроль над управлением и выдачей секретов учетных данных.

## Один пользователь

```
authorization: {
    user: a,
    password: b
}
```

Также можно задать единую пару username/password через:

```
> nats-server --user a --pass b
```

## Несколько пользователей

```
authorization: {
    users: [
        {user: a, password: b},
        {user: b, password: a}
    ]
}
```

## Bcrypted пароли

Username/password также поддерживают bcrypted‑пароли с помощью инструмента [`nats`](../../../../using-nats/nats-tools/nats_cli/). Просто замените пароль в открытом виде на bcrypted значение:

```
> nats server passwd
? Enter password [? for help] **********************
? Reenter password [? for help] **********************

$2a$11$V1qrpBt8/SLfEBr4NJq4T.2mg8chx8.MTblUiTBOLV3MKDeAy.f7u
```

И в конфигурационном файле:

```
authorization: {
    users: [
        {user: a, password: "$2a$11$V1qrpBt8/SLfEBr4NJq4T.2mg8chx8.MTblUiTBOLV3MKDeAy.f7u"},
        ...
    ]
}
```

## Перезагрузка конфигурации

По мере добавления/удаления паролей в конфигурационном файле сервера нужно применять изменения. Чтобы перезагрузить без перезапуска сервера и отключения клиентов, выполните:

```
> nats-server --signal reload
```
