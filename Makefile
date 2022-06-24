.PHONY: all prebuild build clean serve

all: build

build: prebuild build/index.html build/index.js build/index.css build/badge.js

serve: build
	sh -c "cd build; python -m http.server"
	
clean:
	rm -rf build/

prebuild:
	mkdir -p build

lua/liblua.a:
	sh -c "(cd lua && make all CC='emcc -s WASM=1)"

build/badge.js: src/system/main.cpp lua/liblua.a
	em++ -Ilua $^ -O2 -o $@ \
		-std=c++17 \
		-lembind \
		-s WASM=1 \
		-s MODULARIZE=1 \
		-s ASSERTIONS=1 \
		-s 'EXPORT_NAME="createBadgeModule"'

build/%.html: src/pages/%.html
	cp $< $@
build/%.js: src/scripts/%.js
	sh -c "$$(yarn bin)/babel $< --out-file $@ --presets=@babel/preset-env"
build/%.css: src/styles/%.scss
	sh -c "$$(yarn bin)/sass $< $@"
