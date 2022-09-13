# Badge view

## Development (manual)

First, install the following software:

- Git
- Make
- [Node.js](https://nodejs.org) (>= v18) and [Yarn](https://yarnpkg.com/)
- [Emscripten](https://emscripten.org/)

Clone the repository:

```bash
git clone https://github.com:jedevc/badge-view.git --recursive
```

Start the development server:

```
yarn serve
```

## Development (dockerized)

First, install the following software:

- Git
- Docker

```bash
git clone https://github.com:jedevc/badge-view.git --recursive
```

Build the development image (will take some time - the resulting image is
around 2GB):

```
docker buildx build . -t badge-view --load
```

Launch the dev environment:

```
docker run -it -p 8080:8080 -v $PWD/src:/usr/src/app/src badge-view
```
