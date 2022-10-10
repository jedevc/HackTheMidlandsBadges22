# HTM badges

## Development

First, make sure that Docker is installed.

Next, clone the repository:

    git clone https://github.com:jedevc/badge-view.git --recursive

Then, create a `.env` file configured to your preferences. For example:

    cp .env.example .env

Start the development server:

    docker compose up --build

The frontend should be visible at <http://frontend.localhost>, while the
backend should be visible at <http://backend.localhost>.

### Linting

To run auto-formatting:

    make fmt

And to run type-checking using mypy:

    make mypy
