#syntax=docker/dockerfile:1

FROM python:3.10 as base

RUN apt-get update && \
	apt-get install -y wait-for-it

WORKDIR /usr/src/app
COPY ./requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade -r ./requirements.txt

CMD ["/start.sh"]
COPY ./app ./app

ENV PYTHONPYCACHEPREFIX="/var/cache/cpython/"
RUN mkdir -p PYTHONPYCACHEPREFIX

FROM base as dev
EXPOSE 80
COPY --chmod=0755 <<-"EOF" /start.sh
	#!/bin/sh
	set -e
	wait-for-it "${DB_HOST}:5432"
	uvicorn "app:app" --reload --host=0.0.0.0 --port=80
EOF

FROM base as prod
EXPOSE 80
COPY --chmod=0755 <<-"EOF" /start.sh
	#!/bin/sh
	set -e
	wait-for-it "${DB_HOST}:5432"
	uvicorn "app:app" --host=0.0.0.0 --port=80 --workers="${UVICORN_WORKERS:=1}"
EOF
