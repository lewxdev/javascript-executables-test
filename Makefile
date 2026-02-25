.PHONY: install-bun install-deno install-node install build-node build

install-bun:
	bun install --cwd bun

install-deno:
	deno task --cwd deno --eval "deno install"

install-node:
	npm --prefix node install

install: install-bun install-deno install-node

build-node:
	npm --prefix node run build

build: build-node
