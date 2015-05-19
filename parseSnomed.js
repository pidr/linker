#!/usr/bin/env node

/**
 * Module dependencies.
 */

var fs = require('fs');
var JSONStream = require('JSONStream');
var es = require('event-stream');
function parseJsonSnomedtoCui() {

var stream = 	fs.createReadStream('./snomedtocui.json', encoding='utf8')
.pipe(JSONStream.parse('*'));
stream.on('data', function(data) {
		var individual = new Object();
		individual.snomed = data.notation.value;
		individual.cui = data.cui.value;
		var newline = individual.snomed+';'+individual.cui+"\n";
		fs.appendFile('./snomedcui.csv',newline, function(err) {
			if(err) {
				console.log("Ahem !");
			}
		})
		console.log(individual);
	})
}

parseJsonSnomedtoCui();
