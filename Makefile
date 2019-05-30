build: init examples
	rm -rf _.docs
	gitbook build . _docs
	
init:
	gitbook install

serve:
	gitbook serve

examples:
	go run _tools/examplecompiler/main.go -o _examples -r _tools/examplecompiler/example_repos.json -t _tools/examplecompiler/example_template.tmp

deploy: init examples
	rm -rf docs
	gitbook build . docs