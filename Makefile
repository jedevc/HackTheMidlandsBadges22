.PHONY: all prebuild build clean

all: build

build: prebuild build/index.html build/index.js build/badge.js
	
clean:
	rm -rf build/

prebuild:
	mkdir -p build

lua/liblua.a:
	sh -c "(cd lua && make all CC='emcc -s WASM=1)"

build/index.html: index.html
	cp index.html build
build/index.js: index.js
	cp index.js build
build/badge.js: main.cpp lua/liblua.a
	em++ -Ilua main.cpp lua/liblua.a -O2 -o build/badge.js \
		-std=c++17 \
		-lembind \
		-s WASM=1 \
		-s MODULARIZE=1 \
		-s ASSERTIONS=1 \
		-s 'EXPORT_NAME="createBadgeModule"'
