.PHONY: build clean test publish

default: clean build

clean:
	rm -rf dist

build:
	rm -rf dist
	npx rollup -c ./rollup.config.js
	cp "./package.publish.json" dist/package.json

test:
	npx jest ./src

publish:
	cd dist && \
	npm publish --access public