#!/usr/bin/env node

/**
 * Module dependencies.
 */
var program = require('commander');
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
      if(entity1_type=='Gene' && entity2_type=='Disease') {
        console.log(entity1_id + ";" + entity2_id + ";" + association);
      }
      else {
        console.log(entity2_id + ";" + entity1_id + ";" + association);
      }
    }
	})
stream.on('end', function (value) {
  console.log("Lecture terminée");
})
}

function getNegativeAssociations() {

var stream = 	byline(fs.createReadStream('./relationships.tsv'));
stream.setEncoding('utf8');

stream.on('data', function(data) {
    var lineToArray = data.split("\t");
    var entity1_id = lineToArray[0];
    var entity1_type = lineToArray[2];
    var entity2_id = lineToArray[3];
    var entity2_type = lineToArray[5];
    var association = lineToArray[7];
    if(association=='not associated' && ((entity1_type=='Disease' && entity2_type=='Gene')||(entity1_type=='Gene' && entity2_type=='Disease'))) {
      if(entity1_type=='Gene' && entity2_type=='Disease') {
        console.log(entity1_id + ";" + entity2_id + ";" + association);
    }
    else {
      console.log(entity2_id + ";" + entity1_id + ";" + association);

    }
    }
	})
stream.on('end', function (value) {
  console.log("Lecture terminée");
})
}


program
  .version('0.0.1');

program.command('getAssociations <param>')
.description('Get list of associations of a give type')
.action(function(param){
  console.log(param);
  if(param == 'positive') {
    getAssociations();
  }
  else if(param== 'negative') {
    getNegativeAssociations();
  }
});

program.parse(process.argv);
