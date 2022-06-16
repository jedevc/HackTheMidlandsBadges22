#!/bin/bash

(cd lua && make all CC='emcc -s WASM=1')
emcc -Ilua main.c lua/liblua.a -s WASM=1 -O2 -o main.html -s EXPORTED_FUNCTIONS="['_run_lua']" -s EXPORTED_RUNTIME_METHODS=ccall,cwrap