A command line tool for removing extra whitespaces and newlines in a file. Given a file, this tool deletes trailing whitespaces on every line as well as deletes leading and trailing newlines. The original file is overwritten by the trimmed content.

## Installation
```
npm install text-tailor -g
```

## Example Use
```
text-tailor ./path/to/somefile.txt
```
```
text-tailor ./path/to/somefile1.txt ./path/to/somefile2.txt ... ./path/to/somefileN.txt
```