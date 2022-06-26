.PHONY: all prebuild build clean fmt serve

ifeq ($(DEBUG), 1)
CFLAGS=-g -O0 -s ASSERTIONS=1
else
CFLAGS=-O3
endif

all: build

build: prebuild build/index.html build/index.js build/index.css build/badge.js

serve: build
	sh -c "cd build; python -m http.server"

fmt:
	clang-format -i ./src/system/*
	sh -c "$$(yarn bin)/prettier -w ./src"

clean:
	rm -rf build/*

prebuild:
	mkdir -p build

lua/liblua.a:
	sh -c "(cd lua && make all CC='emcc -s WASM=1)"

build/badge.js: src/system/main.cpp lua/liblua.a
	em++ -Ilua $^ -o $@ \
		-std=c++17 \
		-lembind \
		$(CFLAGS) \
		-s WASM=1 \
		-s MODULARIZE=1 \
		-s INITIAL_MEMORY=8MB \
		-s 'EXPORT_NAME="createBadgeModule"'

build/%.html: src/pages/%.html
	cp $< $@
build/%.js: src/scripts/%.js
	sh -c "$$(yarn bin)/babel $< --out-file $@ --presets=@babel/preset-env"
build/%.css: src/styles/%.scss
	sh -c "$$(yarn bin)/sass $< $@"
