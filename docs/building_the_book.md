# Building the Book

The build uses https://github.com/Bandwidth/gitbook-plugin-include-html to include html directly for code examples as well as the prism plugin to handle code highlighting. CSS for code highlighting seems to get mucked up sometimes if you don't use the default them, this is something to work on in the future.

Icons for dev examples are from https://cdn.materialdesignicons.com/3.6.95/.

To build the examples

```bash
% go run tools/examplecompiler/main.go -o developer/examples -r tools/examplecompiler/example_repos.json -t tools/examplecompiler/example_template.tmp
```