# OONI Analyst

This is an internal tool useful for exporting CSV dumps of measurements for a
set of URLs in a given timefram and country.

## Running

```
yarn run build
yarn run start
```

## Environment variables

The environment variables that need to be set on start are:

`CSV_OUTPUT_DIR`: with the full path to where CSV files should be written to
`PG_DSN`: with the postgres DSN
`PYTHON_BINARY_PATH`: with the path to the python binary to use
`REDIS_HOST`: with the hostname of the `REDIS_HOST` (if you start it in docker and link it with `--link redis-instance:redis` this can be `REDIS_HOST=redis`)
`REDIS_PORT`: with the port of the redis instance
