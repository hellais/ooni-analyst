import argparse
import sys

def parse_args():
    p = argparse.ArgumentParser(description='make-csv: creates a csv file for the specified inputs')
    p.add_argument('--output', metavar='PATH', help='Where to write to', required=True)
    p.add_argument('--country', metavar='PROBE_CC', help='Country code to target', required=True)
    p.add_argument('--start-date', metavar='START_DATE', help='Start date interval', required=True)
    p.add_argument('--end-date', metavar='END_DATE', help='End date interval', required=True)
    ## XXX add urls
    opt = p.parse_args()
    return opt

def main():
    opt = parse_args()
    with open(opt.output, 'w') as out_file:
        out_file.write('hello world\n')
    print("hello")

if __name__ == "__main__":
    main()
