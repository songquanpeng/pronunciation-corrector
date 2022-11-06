import argparse
import glob
import json
import os
import sqlite3

import numpy as np


def main(args):
    words = []
    json_list = []
    if args.json_dir:
        json_list.extend(list(glob.glob(os.path.join(args.json_dir, "*.json"))))
    else:
        json_list = [args.json_path]
    vocabularies = {}
    for json_file in json_list:
        word_list = []
        with open(json_file, 'r', encoding='UTF-8') as f:
            data = json.load(f)
            name = data["name"]
            description = data["description"]
            for word in data["words"]:
                tmp = word['word']
                tmp = tmp.rstrip("'s")
                tmp = tmp.rstrip(",")
                tmp = tmp.strip("’")
                tmp = tmp.strip()
                words.append(tmp)
                word_list.append(tmp)
        vocabularies[name] = (word_list, description)
    words = list(set(words))
    words.sort()
    words = [(word,) for word in words]
    connection = sqlite3.connect(args.db_path)
    cursor = connection.cursor()
    cursor.executemany("INSERT OR IGNORE INTO words (text) VALUES(?)", words)
    connection.commit()
    res = cursor.execute("SELECT id, text FROM words")
    words = res.fetchall()
    word2idx = {}
    for idx, word in words:
        word2idx[word] = idx
    size = len(word2idx) + 1
    for name, (local_words, description) in vocabularies.items():
        arr = np.zeros(size, dtype=bool)
        for word in local_words:
            arr[word2idx[word]] = True
        byte_arr = np.packbits(arr, axis=None).tobytes()
        cursor.execute("INSERT OR IGNORE INTO lists (owner_id, name, description, status, words) VALUES(?, ?, ?, ?, ?)",
                       (1, name, description, 2, byte_arr))
        connection.commit()


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--db_path', type=str, default="../.pronunciation-corrector.db")
    parser.add_argument('--json_path', type=str, default="./vocabulary/ef-common-3000.json")
    parser.add_argument('--json_dir', type=str, default="./vocabulary")
    main(parser.parse_args())
