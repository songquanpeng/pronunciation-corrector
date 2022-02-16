import argparse
import json
import os.path


def main(args):
    if not args.input:
        args.input = input('Please input data file path: ')
    args.input = args.input.strip('"').strip("'")
    with open(args.input, 'r') as f:
        content = f.read()
    words = content.split()
    words = list(set(words))
    words.sort(key=lambda s: s.lower())
    if not args.output_name:
        args.output_name = os.path.basename(args.input).split('.')[0]
    vocabulary = {"name": "", "description": "", "words": []}
    for word in words:
        vocabulary["words"].append({
            "word": word,
            "translation": "",
            "pronunciation": ""
        })
    with open(os.path.join(args.output_dir, f"{args.output_name}.json"), 'w') as f:
        print(json.dumps(vocabulary, ensure_ascii=False, indent=4), file=f)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', type=str, default='./temp/common-3000.txt')
    parser.add_argument('--output_dir', type=str, default='vocabulary')
    parser.add_argument('--output_name', type=str)
    main(parser.parse_args())
