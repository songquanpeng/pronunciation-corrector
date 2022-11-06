import argparse
import glob
import json
import os
import sqlite3


def main(args):
    words = []
    json_list = []
    if args.json_dir:
        json_list.extend(list(glob.glob(os.path.join(args.json_dir, "*.json"))))
    else:
        json_list = [args.json_path]
    for json_file in json_list:
        with open(json_file, 'r', encoding='UTF-8') as f:
            data = json.load(f)
            for word in data["words"]:
                tmp = word['word']
                tmp = tmp.rstrip("'s")
                tmp = tmp.rstrip(",")
                tmp = tmp.strip("’")
                tmp = tmp.strip()
                words.append(tmp)
    words = list(set(words))
    words.sort()
    words = [(word,) for word in words]
    connection = sqlite3.connect(args.db_path)
    cursor = connection.cursor()
    cursor.executemany("INSERT OR IGNORE INTO words (text) VALUES(?)", words)
    connection.commit()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--db_path', type=str, default="../.pronunciation-corrector.db")
    parser.add_argument('--json_path', type=str, default="./vocabulary/ef-common-3000.json")
    parser.add_argument('--json_dir', type=str, default="./vocabulary")
    main(parser.parse_args())
