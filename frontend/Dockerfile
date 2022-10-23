# syntax = docker/dockerfile:1
FROM archlinux as build-base

RUN --mount=type=cache,target=/var/cache/pacman/pkg/ \
    pacman -Syu --noconfirm clang patch emscripten make nodejs yarn

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/ \
    yarn install

SHELL ["sh", "--login", "-c"]

FROM build-base as dev

COPY . ./
RUN make internal-build-emscripten

EXPOSE 80
CMD yarn run serve

FROM build-base as build

ARG PLATFORM_DEFAULT_TOKEN
ARG PLATFORM_SERVER_URL
COPY . ./
RUN yarn build

FROM caddy:latest as prod

COPY --from=build /usr/src/app/build /usr/share/caddy/
COPY <<EOF /etc/caddy/Caddyfile
:80 {
    root * /usr/share/caddy
    try_files {path} /
    file_server
}
EOF