#!/usr/bin/env node
"use strict";

const colors = require('colors/safe');
colors.setTheme({
  input: 'grey',
  info: 'green',
  data: 'grey',
  warn: 'yellow',
  error: 'red'
});

let errors = [];

/**
 * @description Trims a file of trailing white/tabspaces and leading and
 * trailing newlines.
 * @param {string} file - The name of the file to be evaluated.
 * @requires fs
 * @requires readline
 * @returns {void}
 */
const trimFile = (file) => {
  console.log(colors.input('Evaluating ' + file + '...'));

  const fs = require('fs'),
    rl = require('readline');

  let lines = [],
    lineReader = rl.createInterface({
      input: fs.createReadStream(file)
    });

  lineReader.on('line', (line) => {
    // trim trailing spaces
    if (line.endsWith(' ') || line.endsWith('\t')) {
      let i = line.length - 1;
      while((line[i] === ' ' || line[i] === '\t') && i > -1) {
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

    let content = lines.join('\n');

    // overwrite original file with trimmed contents
    fs.writeFile(file, content, (err) => {
      if (err) {
        errors.push(err);
      }
    })
  });
}

/**
 * @description Parses command line args and evaluates individual files and
 * files in directories and subdirectories.
 * @requires async
 * @requires commander
 * @requires walk
 * @returns {void}
 */
const main = () => {
  const async = require('async'),
    program = require('commander'),
    walk = require('walk');

  // set up program variables
  program.version('1.0.7');
  program.option('-r, --recursive', 'evaluate files in nested directories');
  program.parse(process.argv);

  let args = program.args,
    recursive = program.recursive,
    calls = [];

  if (!args.length) {
    throw new Error("Insufficient argument(s)");
  }

  // add evaluations to an array of functions to be run in parallel
  for (let pathAddr of args) {
    calls.push((asyncCb) => {
      let walker = walk.walk(pathAddr, {followLinks: false}),
          nestedDirs = [];

      walker.on('file', (path, stat, nextCb) => {
        // normalize path strings
        let homepath = path.replace('//', '/'),
            filepath = (path + '/' + stat.name).replace('//', '/');

        if (nestedDirs.indexOf(homepath) > -1 && !recursive) {
          // do not evaluate if the recursive flag is not set
          nextCb();
        } else {
          trimFile(filepath);
          nextCb();
        }
      });

      walker.on('directory', (path, stat, nextCb) => {
        // check if this dir is nested
        if (!path.includes(stat.name)) {
          // normalize path strings
          let dirpath = (path + '/' + stat.name).replace('//', '/');
          nestedDirs.push(dirpath);
        }

        nextCb();
      });

      walker.on('nodeError', (path, err, nextCb) => {
        errors.push(err.error);
        nextCb();
      });

      walker.on('end', () => {
        asyncCb();
      });
    });
  }

  // run evaluations in parallel
  async.parallel(calls, (err, result) => {
    if (err) {
      console.log(colors.error(err));
    } else {
      // print results
      if (errors.length > 0) {
        for (let error of errors) {
          console.log(colors.error(error));
        }
        console.log(colors.warn('Evaluation completed with ' + errors.length +
          ' error(s).'));
      } else {
        console.log(colors.green('Done!'));
      }

      if (result[0]) {
        console.log(colors.data('Result: ' + result));
      }
    }
  });
}

main();