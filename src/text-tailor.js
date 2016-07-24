#!/usr/bin/env node
"use strict";

let trimFile = (file) => {
	console.log('Evaluating ' + file + '...');

  let lines = [];

  let lineReader = require('readline'),
    fs = require('fs');

  lineReader = lineReader.createInterface({
    input: require('fs').createReadStream(file)
  });

  lineReader.on('line', (line) => {
    // trim trailing spaces
    if (line.endsWith(' ')) {
      let i = line.length - 1;
      while(line[i] === ' ' && i > -1)
        i--;
      line = line.substring(0, i + 1);
    }

    lines.push(line);
  }).on('close', () => {
    let i = 0, j = lines.length - 1;
    // trim leading newlines
    while (lines[i] === '' && i < lines.length + 1)
      i++;
    // trim trailing newlines
    while (lines[j] === '' && j > -1)
      j--;
    lines = lines.slice(i, j + 1);

    let text = lines.join('\n');

    console.log('Writing content to ' + file + '...');
    fs.writeFile(file, text, (err) => {
      if (err) {
        console.log(err);
      }
      console.log('Done!');
    })
  });
}

let trimFilesInDir = (dir) => {
  let fs = require('fs');

  fs.readdir(dir, (err, files) => {
    if (err) {
      console.log('Directory ' + dir + ' not found.');
    } else {
      for (let file in files) {
        trimFile(file);
      }
    }
  });
}

let main = () => {
	let args = process.argv.slice(2);
	if (args.length !== 1) {
		throw new Error("Invalid argument(s)");
	}

	console.log('Running...')

	let file = args[0];
	trimFile(file);
}

main();