FROM bitnami/git:latest as lua-patches

RUN git config --global user.email "bot@example.com" && \
    git config --global user.name "Bot"

WORKDIR /app/lua
COPY .git /app/.git
COPY lua /app/lua
COPY lua_patches /app/patches
RUN git am -3 ../patches/*

FROM emscripten/emsdk:latest as emscripten

WORKDIR /app/
COPY Makefile .
COPY --from=lua-patches /app/lua ./lua
COPY ./src/system/ ./src/system
RUN make build-emscripten

FROM node:latest as site

WORKDIR /app
COPY Makefile package.json yarn.lock .
RUN yarn
COPY src/ ./src/
RUN make build-site

FROM scratch as static

COPY --from=emscripten /app/build/* .
COPY --from=site /app/build/* .
