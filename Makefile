build: init examples
	gitbook build . docs
	
init:
	gitbook install

serve:
	gitbook serve

examples:
	go run tools/examplecompiler/main.go -o _examples -r tools/examplecompiler/example_repos.json -t tools/examplecompiler/example_template.tmp
