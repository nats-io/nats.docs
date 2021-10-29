# Building the Book

Before doing anything else, install the legacy command line for gitbook:

```bash
npm install -g gitbook-cli
```

There is a `Makefile` in the repo that can help building the book easier.  To build and run the docs site http server locally:

```bash
make && make serve
...
info: >> generation finished with success in 45.3s ! 

Starting server ...
Serving book on http://localhost:4000
```

Docs are available as separate items in https://github.com/GitbookIO/gitbook/tree/6efbb70c3298a9106cb2083648624fd1b7af51c0/docs. All of the links go to the new site so you have to poke around manually.

The build uses https://github.com/Bandwidth/gitbook-plugin-include-html to include html directly for code examples as well as the prism plugin, https://github.com/gaearon/gitbook-plugin-prism, to handle code highlighting. CSS for code highlighting seems to get mucked up sometimes if you don't use the default them, this is something to work on in the future. We are also using https://github.com/poojan/gitbook-plugin-toggle-chapters, tried https://github.com/rtCamp/gitbook-plugin-collapsible-menu but it messed up the HTML.

Icons for dev examples are from https://cdn.materialdesignicons.com/3.6.95/.

To build the examples

```bash
go run tools/examplecompiler/main.go -o developer/examples -r tools/examplecompiler/example_repos.json -t tools/examplecompiler/example_template.tmp
```

or just use the make file `make` will download the gitbook plugins, build the example html and build the book.

`make serve` will just serve the files without all the other prep work.
