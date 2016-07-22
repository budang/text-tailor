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
      }
    })
  });
}

let main = () => {
	let files = process.argv.slice(2);

	if (!files.length) {
		throw new Error("Insufficient argument(s)");
	}

	console.log('Running...')

	for (let file of files) {
		trimFile(file);	
	}
  
  console.log('Done!');
}

main();