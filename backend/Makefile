.PHONY: all install start fmt mypy

all: install
	
install: .venv
	sh -c "source .venv/bin/activate && pip install -r requirements.txt && pip install black isort mypy"
.venv:
	virtualenv .venv

up:
	docker compose up --build
down:
	docker compose down

fmt:
	sh -c "source .venv/bin/activate && black app/ && isort --profile=black app/"
mypy:
	sh -c "source .venv/bin/activate && mypy app/"