#!/usr/bin/env node

/**
 * Module dependencies.
 */

var fs = require('fs');
var JSONStream = require('JSONStream');
var es = require('event-stream');
var byline = require('byline');

function getAssociations() {

var stream = 	byline(fs.createReadStream('./relationships.tsv'));
stream.setEncoding('utf8');

stream.on('data', function(data) {
    var lineToArray = data.split("\t");
    var entity1_id = lineToArray[0];
    var entity1_type = lineToArray[2];
    var entity2_id = lineToArray[3];
    var entity2_type = lineToArray[5];
    var association = lineToArray[7];
    if(association=='associated' && ((entity1_type=='Disease' && entity2_type=='Gene')||(entity1_type=='Gene' && entity2_type=='Disease'))) {
      console.log(entity1_id + " " + entity1_type + ";" + entity2_id + " " + entity2_type + ";" + association);
    }
	})
stream.on('end', function (value) {
  console.log("Lecture terminée");
})
}

getAssociations();
