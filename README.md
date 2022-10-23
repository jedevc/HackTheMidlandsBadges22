# HTM badges

## Development

First, make sure that Docker is installed.

Next, clone the repository:

    git clone https://github.com:jedevc/badge-view.git --recursive

Then, create a `.env` file configured to your preferences. For example:

    cp .env.example .env

Start the development server:

    docker compose --profile=dev up --build

The frontend should be visible at <http://frontend.localhost>, while the
backend should be visible at <http://backend.localhost>.

### Linting

To run auto-formatting:

    make fmt

And to run type-checking using mypy:

    make mypy

## Production

Follow the same steps to setup a development environment, then build the
backend server:

    docker compose --profile=prod build prod-backend

Bring up the backend:

    docker compose --profile=prod up -d prod-reverse-proxy prod-backend db

Create a token using the `/docs` backend UI and your pre-made master token. It
should have the following permissions:

```json
{
  "badges": {
    "read": ["*"],
    "write": [],
    "create": false,
    "enumerate": false
  },
  "users": {
    "read": [],
    "write": [],
    "create": false,
    "enumerate": false
  },
  "tokens": {
    "read": [],
    "write": [],
    "create": false,
    "enumerate": false
  },
  "store": {
    "badges": {
      "read": ["*"],
      "write": [],
      "create": false,
      "enumerate": false
    },
    "keys": {
      "read": ["code"],
      "write": [],
      "create": false,
      "enumerate": false
    }
  }
}
```

Use the provided token to populate `FRONTEND_DEFAULT_TOKEN` in your `.env`.

Finally, build and bringup up the rest of the servers:

    docker compose --profile=prod up --build -d
