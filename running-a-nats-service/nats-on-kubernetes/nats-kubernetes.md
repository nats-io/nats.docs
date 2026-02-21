# Введение

Рекомендуемый способ разворачивать NATS в Kubernetes — использовать [Helm](https://helm.sh/) с официальной Helm‑диаграммой NATS.

## Репозиторий Helm

Чтобы зарегистрировать Helm‑чарт NATS, выполните:

```sh
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
```

## Значения конфигурации

Конфигурация по умолчанию развертывает один `nats-server` в виде `StatefulSet` и одну реплику [nats-box](https://github.com/nats-io/nats-box) как `Deployment`.

На [странице ArtifactHub](https://artifacthub.io/packages/helm/nats/nats) перечислены все значения Helm и примеры для текущего релиза.

_Чтобы отслеживать ветку разработки, смотрите [репозиторий исходников](https://github.com/nats-io/k8s/tree/main/helm/charts/nats#nats-server)._ 

Когда нужная конфигурация готова, установите чарта:

```sh
helm install nats nats/nats
```

## Проверка подключения

Когда поды запущены, подтвердите подключение, зайдя в контейнер `nats-box` и выполнив CLI‑команду.

```sh
kubectl exec -it deployment/nats-box -- nats pub test hi
```

Вывод должен подтвердить успешную публикацию в NATS:

```
16:17:00 Published 2 bytes to "test"
```

## Коммерческие варианты

[Synadia](https://www.synadia.com/deploy-for-kubernetes/) предлагает решение Deploy for Kubernetes — вариант самообслуживания и bring‑your‑own Kubernetes, включающий NATS и дополнительные компоненты.
