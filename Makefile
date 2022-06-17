.PHONY: all prebuild build clean

all: build

build: prebuild build/index.html build/index.js build/badge.js

prebuild:
	mkdir -p build

lua/liblua.a:
	sh -c "(cd lua && make all CC='emcc -s WASM=1')"

build/index.html: index.html
	cp index.html build
build/index.js: index.js
	cp index.js build
build/badge.js: main.c lua/liblua.a
	emcc -Ilua main.c lua/liblua.a -O2 -o build/badge.js \
		-s WASM=1 \
		-s EXPORTED_FUNCTIONS="['_run_lua']" \
		-s EXPORTED_RUNTIME_METHODS=ccall,cwrap \
		-s MODULARIZE=1 \
		-s 'EXPORT_NAME="createBadgeModule"'
