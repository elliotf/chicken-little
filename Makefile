testwatch:
	while true; do clear; make test; sleep 1; done

test:
	./node_modules/.bin/mocha --recursive --reporter list -C

clean:
	rm -rf node_modules

install:
	npm install

.PHONY: clean devserver install test testwatch
