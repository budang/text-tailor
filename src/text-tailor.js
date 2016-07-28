#!/usr/bin/env node
"use strict";

let fs = require('fs');

/**
 * Trims a file of trailing whitespaces and leading and trailing newlines.
 * @param {string} file - The name of the file to be evaluated.
 * @requires readline
 * @returns {void}
 */
let trimFile = (file) => {
	console.log('Evaluating ' + file + '...');

  let lines = [];

  let lineReader = require('readline');

  lineReader = lineReader.createInterface({
    input: require('fs').createReadStream(file)
  });

  lineReader.on('line', (line) => {
    // trim trailing spaces
    if (line.endsWith(' ')) {
      let i = line.length - 1;
      while(line[i] === ' ' && i > -1) {
        i--;
      }
      line = line.substring(0, i + 1);
    }

    lines.push(line);
  }).on('close', () => {
    let i = 0, j = lines.length - 1;
    // trim leading newlines
    while (lines[i] === '' && i < lines.length + 1) {
      i++;
    }
    // trim trailing newlines
    while (lines[j] === '' && j > -1) {
      j--;
    }
    lines = lines.slice(i, j + 1);

    let text = lines.join('\n');

    // overwrite original file with trimmed contents
    fs.writeFile(file, text, (statErr) => {
      if (statErr) {
        console.log(statErr);
      } else {
        console.log('Evaluation for ' + file + ' successful!')
      }
    })
  });
}

/**
 * Trims files in a directory and its subdirectories.
 * @param {string} dir - The name of the file to be evaluated.
 * @param {boolean} recurse - If files in subdirectories should be evaluated.
 * @returns {void}
 */
let trimFilesInDir = (dir, recurse) => {
	// normalize input strings
  if (!dir.endsWith('/')) {
    dir += '/';
  }

  // read files and subdirectories
  fs.readdir(dir, (readdirErr, files) => {
    if (!readdirErr) {
      for (let file of files) {
        let path = dir + file;
        fs.stat(path, (statErr, stats) => {
					if (statErr) {
						console.log('ERROR: ' + path + ' could not be found.');
					} else if (stats.isFile(path)) {
						trimFile(path);
					} else if (stats.isDirectory(path) && recurse) {
						trimFilesInDir(path);
					}
				});
      }
    }
  });
}

/**
 * Evaluates individual files and files in directories and subdirectories.
 * @returns {void}
 */
let main = () => {
	let args = process.argv.slice(2);

	if (!args.length || (args.length === 1 && args[0] === '-r')) {
		throw new Error("Insufficient argument(s)");
	}

	// recursive flag
	let r = args.indexOf('-r') > -1;

	console.log('Running...')

	for (let path of args) {
		if (path !== '-r') {
			fs.stat(path, (statErr, stats) => {
				if (statErr) {
					console.log('ERROR: ' + path + ' could not be found.');
				} else if (stats.isFile(path)) {
					trimFile(path);
				} else if (stats.isDirectory(path)) {
					trimFilesInDir(path, r);
				}
			});
		}
	}
}

main();