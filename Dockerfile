# syntax = docker/dockerfile:1
FROM archlinux as build-base

RUN --mount=type=cache,target=/var/cache/pacman/pkg/ \
    pacman -Syu --noconfirm clang git emscripten make nodejs yarn

RUN git config --global user.email "bot@jedevc.com" && \
    git config --global user.name "Bot"

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/ \
    yarn install

FROM build-base as dev

COPY . ./

EXPOSE 8080
CMD ["sh", "--login", "-c", "yarn run serve"]