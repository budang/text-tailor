#!/usr/bin/env node
"use strict";

let fs = require('fs');

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

    fs.writeFile(file, text, (err) => {
      if (err) {
        console.log(err);
      } else {
      	console.log('Evaluation for ' + file + ' successful!')
      }
    })
  });
}

let trimFilesInDir = (dir) => {
	// normalize input strings
  if (!dir.endsWith('/')) {
  	dir += '/';
  }

  fs.readdir(dir, (err, files) => {
    if (!err) {
      for (let file of files) {
        let path = dir + file;
        fs.stat(path, (err, stats) => {
					if (err) {
						console.log('ERROR: ' + path + ' could not be found.');
					} else if (stats.isFile(path)) {
						trimFile(path);
					} else if (stats.isDirectory(path)) {
						// trimFilesInDir(path);
					} else {
						console.log('ERROR: ' + path + ' could not be found.');
					}
				});
      }
    }
  });
}

let main = () => {
	let args = process.argv.slice(2);

	if (!args.length) {
		throw new Error("Insufficient argument(s)");
	}

	console.log('Running...')

	for (let path of args) {
		fs.stat(path, (err, stats) => {
			if (err) {
				console.log('ERROR: ' + path + ' could not be found.');
			} else if (stats.isFile(path)) {
				trimFile(path);
			} else if (stats.isDirectory(path)) {
				trimFilesInDir(path);
			} else {
				console.log('ERROR: ' + path + ' could not be found.');
			}
		});
	}
}

main();