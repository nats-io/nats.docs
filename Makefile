build: init examples
	gitbook build . docs
	
init:
	gitbook install

serve:
	gitbook serve

examples:
	go run _tools/examplecompiler/main.go -o _examples -r _tools/examplecompiler/example_repos.json -t _tools/examplecompiler/example_template.tmp
