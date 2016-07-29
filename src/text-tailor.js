#!/usr/bin/env node
"use strict";

let fs = require('fs'),
  walk = require('walk');

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
        console.log('Evaluation for ' + file + ' successful!');
      }
    })
  });
}

/**
 * Evaluates individual files and files in directories and subdirectories.
 * @requires async
 * @returns {void}
 */
let main = () => {
  let args = process.argv.slice(2);

  if (!args.length || (args.length === 1 && args[0] === '-r')) {
    throw new Error("Insufficient argument(s)");
  }

  // recursive flag
  // let recurse = args.indexOf('-r') > -1;

  console.log('Running...');

  let async = require('async');

  let calls = [];

  for (let pathAddr of args) {
    // if (pathAddr !== '-r') {
      calls.push((asyncCallback) => {
        let walker = walk.walk(pathAddr, {followLinks: false});

        walker.on('file', (path, stat, next) => {
          // normalize path strings
          let filepath = (path + '/' + stat.name).replace('//', '/');

          trimFile(filepath);
          next();
        });

        walker.on('directory', (path, stat, next) => {
          next();
        });

        walker.on('nodeError', (path, err, next) => {
          console.log(err.error);
          next();
        });

        walker.on('end', () => {
          console.log('walker done, print stuff from ASYNC now');
          asyncCallback();
        });
      });
    // }
  }

  async.parallel(calls, (asyncErr, result) => {
    console.log('IS THIS DONE YET??');
    if (asyncErr) {
      console.log(asyncErr);
    } else {
      console.log(result);
      console.log('xxxxxxxxxxxxxxxxxxxxxx');
    }
  });
}

main();