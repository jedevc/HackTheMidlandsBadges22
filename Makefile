.PHONY: all serve fmt mypy

all:

serve:
	docker compose up --build

fmt:
	sh -c "black backend/app/ && isort --profile=black backend/app/ "
	sh -c "clang-format -i frontend/src/system/**/*.cpp"
	sh -c "prettier -w ./frontend/src"

mypy:
	sh -c "cd backend/ && mypy app/"