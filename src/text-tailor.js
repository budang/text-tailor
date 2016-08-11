#!/usr/bin/env node

/**
 * @description Parses command line args and evaluates individual files and
 * files in directories and subdirectories.
 * @requires async
 * @requries colors/safe
 * @requires commander
 * @requires fs
 * @requires path
 * @requires readline
 * @requires walk
 * @returns {void}
 */
(() => {
  "use strict";

  // dependencies
  const async = require('async'),
    colors = require('colors/safe'),
    fs = require('fs'),
    rl = require('readline'),
    path = require('path'),
    program = require('commander'),
    walk = require('walk');

  // list of errors
  let errors = [];

  /**
   * @description Trims a file of trailing white/tabspaces and leading and
   * trailing newlines.
   * @param {string} file - The name of the file to be evaluated.
   * @returns {void}
   */
  const trimFile = (file) => {
    console.log(colors.input('Evaluating ' + file + '...'));

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
    });

    lineReader.on('close', () => {
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

  // set color themes
  colors.setTheme({
    input: 'grey',
    info: 'green',
    data: 'grey',
    warn: 'yellow',
    error: 'red'
  });

  // set up program variables
  program.version('1.0.10');
  program.usage('[options] <param1, param2, …, paramN>');
  program.option('-r, --recursive', 'evaluate files in nested directories');
  program.parse(process.argv);

  // recursive flag, list of arguments, list of function calls
  let recursive = program.recursive,
    args = [],
    calls = [];

  // check if any arguments were passed
  if (!program.args.length) {
    throw new Error("Insufficient arguments: no arguments specified");
  }

  // populate list of arguments to evaluate
  for (let arg of program.args) {
    // normalize path strings
    let pathAddr = '';
    if (path.extname(arg)) {
      pathAddr = path.normalize(arg);
    } else {
      pathAddr = path.normalize(arg + '/');
    }
    if (!pathAddr.startsWith('./') && !pathAddr.startsWith('../')) {
      pathAddr = './' + pathAddr;
    }

    // add unique args
    if (args.indexOf(pathAddr) === -1) {
      args.push(pathAddr);
    }
  }

  // add evaluations to be run in parallel
  for (let pathAddr of args) {
    calls.push((asyncCb) => {
      let walker = walk.walk(pathAddr, {followLinks: false}),
        nestedDirs = [];

      walker.on('file', (addr, stat, nextCb) => {
        // normalize path strings
        let homepath = path.normalize(addr + '/'),
            filepath = path.normalize(homepath + stat.name);

        if (nestedDirs.indexOf(homepath) > -1 && !recursive) {
          // do not evaluate if the recursive flag is not set
          nextCb();
        } else {
          trimFile(filepath);
          nextCb();
        }
      });

      walker.on('directory', (addr, stat, nextCb) => {
        // check if this dir is nested
        if (!addr.includes(stat.name)) {
          let dirpath = path.normalize(addr + stat.name + '/');
          nestedDirs.push(dirpath);
        }
        nextCb();
      });

      walker.on('nodeError', (addr, err, nextCb) => {
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
})();