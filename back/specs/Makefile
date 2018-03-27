all:

deps: raml-deps

test: ramlev

raml-lint:
	ramllint spec/*.raml
	
ramlev:
	ramlev spec/web-ui.raml

raml-deps:
	npm i -g raml2md
	npm i -g raml2html
	npm i -g ramllint
	npm i -g ramlev

raml_files = $(shell ls spec/*.raml)

raml:
	@find ./spec -name "*.raml" -exec raml2md {} -o {}.md \;
	@find ./spec -name "*.raml" -exec raml2html {} -o {}.html \;
