A command line tool for removing extra whitespaces and newlines in a file. Given a file, this tool deletes trailing whitespaces on every line as well as deletes leading and trailing newlines. The original file is overwritten by the trimmed content. If a directory is specified, files in the directory will be evaluated. If the recursive flag ```-r``` is set, files in nested subdirectories will also be evaluated.

## Installation
```
npm install text-tailor -g
```

## Example Uses
For a single file:
```
text-tailor ./path/to/file.txt
```
For multiple files:
```
text-tailor ./path/to/file1.txt ./path/to/file2.txt ... ./path/to/fileN.txt
```
For a single directory, non-recursively:
```
text-tailor ./path/to/dir
```
For a single directory, recursively:
```
text-tailor ./path/to/dir -r
```
For multiple files and directories, recursively:
```
text-tailor ./path/to/file1 ./path/to/dir1 ... ./path/to/fileN ./path/to/dirN -r
```