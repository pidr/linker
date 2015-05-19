#!/usr/bin/env node

/**
 * Module dependencies.
 */

var fs = require('fs');
var JSONStream = require('JSONStream');
var es = require('event-stream');
var byline = require('byline');
var redis = require('redis');
var redisClient = redis.createClient();

function indexDrugstoPGKB() {

var stream = 	byline(fs.createReadStream('./drugs.tsv'));
stream.setEncoding('utf8');

stream.on('data', function(data) {
    var lineToArray = data.split("\t");
    var name = lineToArray[1];
    var pharmId = lineToArray[0];
    console.log(name + " " + pharmId);

		redisClient.sadd(name, pharmId, redis.print);

	})
stream.on('end', function (value) {
  console.log("Indexation terminée");
})
}

indexDrugstoPGKB();
