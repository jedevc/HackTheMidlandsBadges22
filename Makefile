.PHONY: all prebuild build build-emscripten build-site clean fmt serve

ifeq ($(DEBUG), 1)
CFLAGS=-g -O0 -s ASSERTIONS=1
else
CFLAGS=-O3
endif

all: build
build: build-emscripten build-site
build-emscripten: prebuild build/badge.emscripten.js
build-site: prebuild build/index.html build/index.js build/index.css

serve: build
	sh -c "cd build; python -m http.server"

fmt:
	sh -c "clang-format -i ./src/system/**/*.cpp"
	sh -c "$$(yarn bin)/prettier -w ./src"

clean:
	rm -rf build/*

prebuild:
	mkdir -p build

lua/liblua.a:
	sh -c "(cd lua && make all CC='emcc -s WASM=1')"

build/badge.emscripten.js: $(shell find src/system/ -type f -name *.cpp) lua/liblua.a
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
	sh -c "$$(yarn bin)/browserify $< -o $@ -t [ babelify --presets [ @babel/preset-env ] ]"
build/%.css: src/styles/%.scss
	sh -c "$$(yarn bin)/sass $< $@"
