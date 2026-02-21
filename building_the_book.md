# Сборка книги

Перед началом установите устаревший CLI для gitbook:

```bash
npm install -g gitbook-cli
```

В репозитории есть `Makefile`, который упрощает сборку книги. Чтобы собрать и запустить локальный HTTP‑сервер сайта документации:

```bash
make && make serve
...
info: >> generation finished with success in 45.3s ! 

Starting server ...
Serving book on http://localhost:4000
```

Документация доступна отдельными файлами в https://github.com/GitbookIO/gitbook/tree/6efbb70c3298a9106cb2083648624fd1b7af51c0/docs. Все ссылки ведут на новый сайт, поэтому приходится просматривать вручную.

Сборка использует https://github.com/Bandwidth/gitbook-plugin-include-html, чтобы включать HTML напрямую для примеров кода, а также плагин prism https://github.com/gaearon/gitbook-plugin-prism для подсветки кода. CSS для подсветки иногда ломается, если не использовать тему по умолчанию — это стоит доработать в будущем. Также используется https://github.com/poojan/gitbook-plugin-toggle-chapters; пробовали https://github.com/rtCamp/gitbook-plugin-collapsible-menu, но он ломал HTML.

Иконки для примеров разработчика взяты из https://cdn.materialdesignicons.com/3.6.95/.

Чтобы собрать примеры:

```bash
go run tools/examplecompiler/main.go -o developer/examples -r tools/examplecompiler/example_repos.json -t tools/examplecompiler/example_template.tmp
```

Либо просто используйте `make`: он скачает плагины gitbook, соберет HTML примеров и соберет книгу.

`make serve` просто отдаст файлы без подготовительных шагов.
