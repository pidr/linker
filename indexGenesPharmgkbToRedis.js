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

var stream = 	byline(fs.createReadStream('./genes.tsv'));
stream.setEncoding('utf8');

stream.on('data', function(data) {
    var lineToArray = data.split("\t");
    var entrezId = lineToArray[1];
    var pharmId = lineToArray[0];
    console.log(entrezId + " " + pharmId);

		redisClient.sadd(entrezId, pharmId, redis.print);

	})
stream.on('end', function (value) {
  console.log("Indexation terminée");
})
}

indexDrugstoPGKB();
