# text-tailor

A command line tool for removing extra whitespaces, tabspaces, and newlines in a text or code file. Given a filepath, this tool deletes trailing whitespaces and tabspaces on every line in the file as well as deletes leading and trailing newlines. The original file is overwritten by the trimmed content. If a directory is specified, files in the immediate directory will be evaluated. If the recursive flag ```-r``` is set, files in nested subdirectories will also be evaluated. Multiple files and directories may be evaluated at once.

## Installation
```
npm install text-tailor -g
```

## Example Uses
For a single file:
```
text-tailor path/to/file.txt
```
For multiple files:
```
text-tailor path/to/file1.txt path/to/file2.txt ... path/to/fileN.txt
```
For a single directory, non-recursively:
```
text-tailor path/to/dir
```
For a single directory, recursively:
```
text-tailor path/to/dir -r
```
For multiple files and directories, recursively:
```
text-tailor path/to/file1.txt path/to/dir1 ... path/to/fileN.txt path/to/dirN -r
```