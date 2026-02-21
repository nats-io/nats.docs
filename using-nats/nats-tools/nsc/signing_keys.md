# Ключи подписи

Как уже обсуждалось, NKEY — это идентичности, и если кто‑то получит nkey аккаунта или оператора, он сможет делать всё, что можете вы.

NATS предлагает стратегии для случаев, когда приватные ключи утекают.

Первая и самая важная линия защиты — _Signing Keys_. _Signing Keys_ позволяют иметь несколько NKEY‑идентичностей одного типа (Operator или Account) с тем же уровнем доверия, что и стандартный nkey‑_Issuer_.

Идея signing key в том, что вы выпускаете JWT для оператора или аккаунта, в котором перечислены несколько nkeys. Обычно issuer соответствует _Subject_ сущности, выпускающей JWT. С SigningKeys JWT считается валидным, если он подписан _Subject_‑ом _Issuer_ или одним из его signing keys. Это позволяет лучше защищать приватный ключ Operator или Account, при этом разрешая подписывать _Accounts_, _Users_ или _Activation Tokens_ альтернативными приватными ключами.

Если возникает проблема и signing key каким‑то образом утек, нужно удалить скомпрометированный signing key из сущности, добавить новый и перевыпустить сущность. При проверке JWT, если signing key отсутствует, операция отклоняется. Также вам нужно перевыпустить все JWT (аккаунты, пользователи, activation tokens), которые были подписаны скомпрометированным ключом.

Это, по сути, «большой молот». Можно смягчить процесс, используя больше signing keys и затем ротируя их, чтобы получить распределение, с которым вам проще работать при компрометации. В будущих релизах появится процесс отзыва, где можно будет инвалидировать один JWT по его уникальному JWT ID (JTI). Пока же — только «кувалда».

Чем выше безопасность, тем выше сложность. При этом `nsc` не отслеживает публичные или приватные signing keys. Это идентичности, которые предполагают ручное использование. Это означает, что вы должны более тщательно отслеживать и управлять своими приватными ключами.

Разберем workflow. Мы собираемся:

* Создать оператора с signing key
* Создать аккаунт с signing key
* Подписать аккаунт signing key оператора
* Создать пользователя с signing key аккаунта

Все операции с signing keys используют глобальный флаг `nsc` `-K` или `--private-key`. Каждый раз, когда вы хотите изменить сущность, нужно передать родительский ключ, чтобы JWT был подписан. Обычно это происходит автоматически, но в случае signing keys вам нужно указывать флаг вручную.

Создаем оператора:

```shell
nsc add operator O2
```
```
[ OK ] generated and stored operator key "OABX3STBZZRBHMWMIMVHNQVNUG2O3D54BMZXX5LMBYKSAPDSHIWPMMFY"
[ OK ] added operator "O2"
```

Чтобы добавить signing key, сначала сгенерируем его с `nsc`:

```shell
nsc generate nkey --operator --store
```

```
SOAEW6Z4HCCGSLZJYZQMGFQY2SY6ZKOPIAKUQ5VZY6CW23WWYRNHTQWVOA
OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5
operator key stored ~/.nkeys/keys/O/AZ/OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5.nk
```

> В production приватные ключи следует сохранять в файл и всегда ссылаться на защищенный файл.

Теперь отредактируем оператора, добавив signing key флагом `--sk` и передав публичный ключ оператора (начинается с `O`):

```shell
nsc edit operator --sk OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5
```

```
[ OK ] added signing key "OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5"
[ OK ] edited operator "O2"
```

Проверим результат:

```shell
nsc describe operator
```

```
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

Теперь создадим аккаунт `A` и подпишем его приватным signing key оператора. Чтобы подписать, укажите флаг `-K` и приватный ключ или путь к нему:

```shell
nsc add account A -K ~/.nkeys/keys/O/AZ/OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5.nk
```

```
[ OK ] generated and stored account key "ACDXQQ6KD5MVSFMK7GNF5ARK3OJC6PEICWCH5PQ7HO27VKGCXQHFE33B"
[ OK ] added account "A"
```

Сгенерируем account signing key (снова через `nsc`):

```bash
nsc generate nkey --account --store
```

```
SAAA4BVFTJMBOW3GAYB3STG3VWFSR4TP4QJKG2OCECGA26SKONPFGC4HHE
ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7
account key stored ~/.nkeys/keys/A/DU/ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7.nk
```

Добавим signing key в аккаунт и подпишем аккаунт signing key оператора:

```shell
nsc edit account --sk ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7 -K ~/.nkeys/keys/O/AZ/OAZBRNE7DQGDYT5CSAGWDMI5ENGKOEJ57BXVU6WUTHFEAO3CU5GLQYF5.nk
```

```
[ OK ] added signing key "ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7"
[ OK ] edited account "A"
```
Посмотрим аккаунт:

```shell
nsc describe account
```

```
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

Мы видим, что signing key `ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7` добавлен в аккаунт. Также issuer — signing key оператора (переданный через `-K`).

Теперь создадим пользователя и подпишем его signing key аккаунта, начинающимся с `ADUQTJD4TF4O`.

```shell
nsc add user U -K ~/.nkeys/keys/A/DU/ADUQTJD4TF4O6LTTHCKDKSHKGBN2NECCHHMWFREPKNO6MPA7ZETFEEF7.nk
```

```
[ OK ] generated and stored user key "UD47TOTKVDY4IQRGI6D7XMLZPHZVNV5FCD4CNQICLV3FXLQBY72A4UXL"
[ OK ] generated user creds file "~/.nkeys/creds/O2/A/U.creds"
[ OK ] added user "U" to account "A"
```
Проверим пользователя:
```shell
nsc describe user
```

```
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

Как и ожидалось, issuer теперь — signing key, который мы сгенерировали ранее. Чтобы связать пользователя с реальным аккаунтом, в JWT добавлено поле `Issuer Account`, которое содержит публичный ключ аккаунта _A_.

## Scoped Signing Keys

Scoped Signing Keys упрощают управление правами пользователей. Ранее, если вы хотели ограничить права пользователей, нужно было задавать права каждому пользователю отдельно. С scoped signing keys вы связываете signing key с набором прав. Эта конфигурация хранится в JWT аккаунта и управляется командой `nsc edit signing-key`. Можно добавить сколько угодно scoped signing keys.

Чтобы выпустить пользователя с набором прав, просто подпишите пользователя signing key с нужным набором прав. Конфигурация пользователя _не должна_ содержать никаких прав.

При подключении nats-server назначит пользователю права, связанные с этим signing key. Если вы обновите права, связанные с signing key, сервер немедленно обновит права пользователей, подписанных этим ключом.

```shell
nsc add account A
```

```
[ OK ] generated and stored account key "ADLGEVANYDKDQ6WYXPNBEGVUURXZY4LLLK5BJPOUDN6NGNXLNH4ATPWR"
[ OK ] push jwt to account server:
       [ OK ] pushed account jwt to the account server
       > NGS created a new free billing account for your JWT, A [ADLGEVANYDKD].
       > Use the 'ngs' command to manage your billing plan.
       > If your account JWT is *not* in ~/.nsc, use the -d flag on ngs commands to locate it.
[ OK ] pull jwt from account server
[ OK ] added account "A"
```
Сгенерируйте signing key:

```shell
nsc edit account -n A --sk generate
```

```
[ OK ] added signing key "AAZQXKDPOTGUCOCOGDW7HWWVR5WEGF3KYL7EKOEHW2XWRS2PT5AOTRH3"
[ OK ] push jwt to account server
[ OK ] pull jwt from account server
[ OK ] account server modifications:
       > allow wildcard exports changed from true to false
[ OK ] edited account "A"
