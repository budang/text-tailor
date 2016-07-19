#!/usr/bin/env node

(function() {
	var args = process.argv.slice(2);

	if(args.length !== 1)
		throw new Error("Invalid argument(s)");

	console.log('Running...')

	var file = args[0];
	console.log('Evaluating ' + file + '...');

	var lines = [];

	var lineReader = require('readline'),
		fs = require('fs');

	lineReader = lineReader.createInterface({
		input: require('fs').createReadStream(file)
	});

	lineReader.on('line', function(line) {
		// trim trailing spaces
		if(line.endsWith(' ')) {
			var i = line.length - 1;
			while(line[i] === ' ' && i > -1)
				i--;
			line = line.substring(0, i + 1);
		}

		lines.push(line);
	}).on('close', function() {
		var i = 0, j = lines.length - 1;
		// trim leading newlines
		while(lines[i] === '' && i < lines.length + 1)
			i++;
		// trim trailing newlines
		while(lines[j] === '' && j > -1)
			j--;
		lines = lines.slice(i, j + 1);

		var text = lines.join('\n');

		console.log('Writing content to ' + file + '...');
		fs.writeFile(file, text, function(err) {
			if(err)
				console.log(err);
			console.log('Done!');
		})
	});
})();