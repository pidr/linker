#!/usr/bin/env node

/**
 * Module dependencies.
 */

var fs = require('fs');
var JSONStream = require('JSONStream');
var es = require('event-stream');
var redis = require('redis');
var redisClient = redis.createClient();

function indexJsonSnomedtoCui() {

var stream = 	fs.createReadStream('./convertcsv.json', encoding='utf8')
.pipe(JSONStream.parse('*'));
stream.on('data', function(data) {

    var snomed = data.snomed;
    var cui = data.cui;
		redisClient.set(snomed, cui, redis.print);
		console.log(snomed + " " + cui);
	})
stream.on('end', function (value) {
  console.log("Indexation terminée");
})
}

indexJsonSnomedtoCui();
