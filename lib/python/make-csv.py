import os
import sys
import argparse
from datetime import datetime

import pandas as pd
import psycopg2

def query(q, params, pg_dsn):
    # XXX this is useful for debugging
    """
    import yaml
    from sshtunnel import SSHTunnelForwarder
    with open('private/secrets.yml') as in_file:
        secrets = yaml.load(in_file)
    with SSHTunnelForwarder(
        ('hkgmetadb.infra.ooni.io', 22),
        ssh_username='art',
        ssh_private_key=secrets['ssh_private_key_path'],
        remote_bind_address=('localhost', 5432)
    ) as server:
        conn = psycopg2.connect(
            host='localhost',
            port=server.local_bind_port,
            user='shovel',
            password=secrets['shovel_password'],
            dbname='metadb')
        return pd.read_sql_query(q, conn, params=params)
    """
    conn = psycopg2.connect(pg_dsn)
    return pd.read_sql_query(q, conn, params=params)


def make_csv(output_path, urls, probe_cc, start_date, end_date, pg_dsn):
    countries = [probe_cc]
    params = [start_date, end_date, probe_cc]
    for url in urls:
        params.append(url)

    base_query = """SELECT measurement.test_runtime,
    input.input,
    measurement.measurement_start_time,
    report.probe_cc,
    report.probe_asn,
    report.probe_ip,
    report.report_id,
    http_verdict.http_experiment_failure,
    http_verdict.blocking
    FROM measurement
    JOIN input ON input.input_no = measurement.input_no
    JOIN report ON report.report_no = measurement.report_no
    JOIN http_verdict ON http_verdict.msm_no = measurement.msm_no
    """
    where_clause = "WHERE ({}) AND ({}) AND ({})".format(
        " measurement.measurement_start_time BETWEEN %s AND %s",
        " OR ".join(["report.probe_cc = %s" for _ in countries]),
        " OR ".join(["input = %s" for _ in urls]),
    )
    q = base_query + where_clause
    print(q)
    print(params)
    res = query(q, params, pg_dsn)
    print(res)
    res.to_csv(output_path)

def parse_args():
    p = argparse.ArgumentParser(description='make-csv: creates a csv file for the specified inputs')
    p.add_argument('--output', metavar='PATH', help='Where to write to', required=True)
    p.add_argument('--country', metavar='PROBE_CC', help='Country code to target', required=True)
    p.add_argument('--start-date', metavar='START_DATE', help='Start date interval', required=True)
    p.add_argument('--end-date', metavar='END_DATE', help='End date interval', required=True)
    p.add_argument('--urls', metavar='URL', nargs='*', help='URLs to test')
    p.add_argument('--postgres', metavar='DSN', help='libpq data source name')
    ## XXX add urls
    opt = p.parse_args()
    return opt

def main():
    opt = parse_args()
    make_csv(output_path=opt.output,
             urls=opt.urls,
             probe_cc=opt.country,
             start_date=opt.start_date,
             end_date=opt.end_date,
             pg_dsn=opt.postgres)
    print(opt.output)

if __name__ == "__main__":
    main()
