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

function indexSnomedtoSider() {

var stream = 	byline(fs.createReadStream('./meddra_adverse_effects.tsv'));
stream.setEncoding('utf8');

stream.on('data', function(data) {
    var lineToArray = data.split("\t");
    var snomedCui = lineToArray[6];
    var sider = lineToArray[3];
    console.log(sider + " " + snomedCui);

		redisClient.sadd(snomedCui, sider, redis.print);
		console.log(snomedCui + " " + sider);
	})
stream.on('end', function (value) {
  console.log("Indexation terminée");
})
}

indexSnomedtoSider();
