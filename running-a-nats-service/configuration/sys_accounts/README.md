# Системные события

Серверы NATS используют поддержку [Accounts](../securing_nats/accounts.md) и генерируют события, такие как:

* подключение/отключение аккаунта
* ошибки аутентификации
* остановка сервера
* сводка статистики сервера

Кроме того, сервер поддерживает ограниченное число запросов, которыми можно получать список подключений аккаунтов, сводки статистики сервера и выполнять ping серверов в кластере.

Эти события включаются настройкой `system_account` и [подпиской/запросами](./#available-events-and-services) от пользователя _system account_.

[Accounts](../securing_nats/accounts.md) используются, чтобы подписки приложений, например `>`, не получали системные события, и наоборот. Использование accounts требует одного из вариантов:

* [Локальная настройка аутентификации](./#local-configuration) и указание одного из аккаунтов в `system_account`
* или децентрализованная аутентификация и авторизация через [jwt](../securing_nats/jwt/) как показано в этом [руководстве](sys_accounts.md). В этом случае `system_account` содержит публичный ключ аккаунта.

Примечание: глобальный аккаунт по умолчанию `$G` не публикует уведомления.

<a id="available-events-and-services"></a>
## Доступные события и сервисы

### System Account

System account публикует сообщения под хорошо известными шаблонами subject.

События, инициируемые сервером:

* `$SYS.ACCOUNT.<id>.CONNECT` (клиент подключается)
* `$SYS.ACCOUNT.<id>.DISCONNECT` (клиент отключается)
* `$SYS.ACCOUNT.<id>.SERVER.CONNS` (изменилось число соединений аккаунта)
* `$SYS.SERVER.<id>.CLIENT.AUTH.ERR` (ошибка аутентификации)
* `$SYS.SERVER.<id>.STATSZ` (сводка статистики)

Кроме того, другие инструменты с привилегиями system account могут инициировать запросы (примеры см. [здесь](sys_accounts.md#system-services)):

* `$SYS.REQ.SERVER.<id>.STATSZ` (запрос сводки статистики сервера)
* `$SYS.REQ.SERVER.PING` (обнаружение серверов — вернет несколько сообщений)

[Эндпоинты мониторинга](../monitoring.md), перечисленные в таблице ниже, доступны как system services по следующему шаблону subject:

* `$SYS.REQ.SERVER.<id>.<endpoint-name>` (запрос endpoint мониторинга сервера по имени endpoint).
* `$SYS.REQ.SERVER.PING.<endpoint-name>` (со всех серверов, запрос endpoint мониторинга сервера по имени endpoint — вернет несколько сообщений)

| Endpoint                                                                  | Endpoint Name |
| ------------------------------------------------------------------------- | ------------- |
| [Общая информация о сервере](../monitoring.md#general-information)        | `VARZ`        |
| [Соединения](../monitoring.md#connection-information)                    | `CONNZ`       |
| [Маршрутизация](../monitoring.md#route-information)                      | `ROUTEZ`      |
| [Gateways](../monitoring.md#gateway-information)                         | `GATEWAYZ`    |
| [Leaf Nodes](../monitoring.md#leaf-nodes-information)                    | `LEAFZ`       |
| [Маршрутизация подписок](../monitoring.md#subscription-routing-information) | `SUBSZ`    |
| [JetStream](../monitoring.md#jetstream-information)                      | `JSZ`         |
| [Accounts](../monitoring.md#account-information)                         | `ACCOUNTZ`    |
| [Health](../../nats_admin/monitoring/#health)                            | `HEALTHZ`     |

* `"$SYS.REQ.ACCOUNT.<account-id>.<endpoint-name>` (со всех серверов, запрос специфического для аккаунта endpoint мониторинга по account id и имени endpoint — вернет несколько сообщений)

| Endpoint                                                                  | Endpoint Name |
| ------------------------------------------------------------------------- | ------------- |
| [Соединения](../monitoring.md#connection-information)                    | `CONNZ`       |
| [Leaf Nodes](../monitoring.md#leaf-nodes-information)                    | `LEAFZ`       |
| [Маршрутизация подписок](../monitoring.md#subscription-routing-information) | `SUBSZ`    |
| [JetStream](../monitoring.md#jetstream-information)                      | `JSZ`         |
| [Account](../monitoring.md#account-information)                          | `INFO`        |

Серверы вроде `nats-account-server` публикуют сообщения system account при обновлении claim, а `nats-server` слушает их и соответствующим образом обновляет информацию об аккаунте:

* `$SYS.ACCOUNT.<id>.CLAIMS.UPDATE`

Этих нескольких сообщений достаточно, чтобы построить полезные инструменты мониторинга:

* состояние/нагрузка ваших серверов
* подключение/отключение клиентов
* подключения аккаунтов
* ошибки аутентификации

<a id="local-configuration"></a>
## Локальная конфигурация

Чтобы использовать системные события, достаточно включить accounts; конфигурация может выглядеть так:

```text
accounts: {
    USERS: {
        users: [
            {user: a, password: a}
        ]
    }

    SYS: {
        users: [
            {user: admin, password: changeit}
        ]
    }
}

system_account: SYS
```

Обратите внимание, что приложения теперь должны аутентифицироваться так, чтобы соединение могло быть сопоставлено с аккаунтом. В этом примере логин и пароль выбраны для простоты демонстрации. Подпишитесь на все системные события так: `nats sub -s nats://admin:changeit@localhost:4222 ">"` и наблюдайте, что происходит, когда вы, например, выполняете `nats pub -s "nats://a:a@localhost:4222" foo bar`. Примеры использования system services см. [здесь](sys_accounts.md#system-services).
