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

# Badge platform

## Development

To simplify local development operations, you can use the provided `Makefile`
as a command runner.

First, ensure that you have Docker installed.

Then, create a `.env` file configured to your preferences. For example:

    cp .env.example .env

Finally, start a server on <http://localhost:8000>:

    make up

The OpenAPI spec for the badge platform is available at
<http://localhost:8000/openapi.json>, with the swagger UI provided at
<http://localhost:8000/docs>.

### Linting

To run auto-formatting using black+isort:

    make fmt

And to run type-checking using mypy:

    make mypy
    
You will need to have these tools installed! You can install them using the
`Makefile` utility:

    make install
