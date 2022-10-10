.PHONY: all internal-prebuild internal-build-emscripten internal-patch-emscripten

all:

internal-build-emscripten: internal-prebuild internal-patch-emscripten tmp/badge.emscripten.js

internal-patch-emscripten:
	sh -c "cd vendor/lua && git am -3 ../../patches/lua/*"

internal-prebuild:
	mkdir -p build tmp

ifeq ($(DEBUG), 1)
CFLAGS=-g -O0 -s ASSERTIONS=1
else
CFLAGS=-O3
endif

vendor/lua/liblua.a:
	make -C vendor/lua all CC='emcc -s WASM=1'

tmp/badge.emscripten.js: $(shell find src/system/ -type f -name *.cpp) vendor/lua/liblua.a
	em++ -Ivendor/lua $^ -o $@ \
		-std=c++17 \
		-lembind \
		$(CFLAGS) \
		-s WASM=1 \
		-s MODULARIZE=1 \
		-s ENVIRONMENT='web' \
		-s INITIAL_MEMORY=8MB \
		-s 'EXPORT_NAME="createBadgeModule"'
