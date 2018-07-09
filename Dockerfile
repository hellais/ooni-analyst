FROM node:carbon
ENV CSV_OUTPUT_DIR /data/csv
ENV PYTHON_BINARY_PATH /usr/src/venv/bin/python

# Python related
RUN set -ex \
    && apt-get update \
    && apt-get -y install python-pip \
    && pip install virtualenv

RUN set -ex \
    && virtualenv /usr/src/venv \
    && /usr/src/venv/bin/pip install pandas psycopg2-binary

RUN set -ex \
    && mkdir -p $CSV_OUTPUT_DIR \
    && chown -R daemon:daemon $CSV_OUTPUT_DIR

# BEGIN root
USER root
COPY . /usr/src/app
RUN set -ex \
    && chown -R node:node /usr/src/app \
    && :
# END root

USER node
WORKDIR /usr/src/app

# .cache removal leads to two times smaller image and
RUN set -ex \
    && yarn install --frozen-lockfile \
    && yarn run build \
    && rm -rf /home/node/.cache \
    && :

EXPOSE 3200

USER daemon
CMD [ "yarn", "run", "start" ]
