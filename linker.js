#! /usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var SparqlClient = require('sparql-client');
var request = require('request');
var Datastore = require('nedb');
var JSONStream = require('JSONStream');
var es = require('event-stream');
var fs = require('graceful-fs');
var redis = require('redis'),
		redisClient = redis.createClient();

// var db_snomed_cui = new Datastore({ filename: 'snomedcui.json', autoload: true,corruptAlertThreshold:1 });
// var snomedcui_file = require('./convertcsv.json');
// db_snomed_cui.insert(snomedcui_file, function (err, newDoc) {   // Callback is optional
//   if(err) {
//     console.log(err);
//   }
// });

// db_snomed_cui.loadDatabase();

function getCui(snomed_id, callback) {
	var options = {
		url: 'http://data.bioontology.org/ontologies/SNOMEDCT/classes/http%3A%2F%2Fpurl.bioontology.org%2Fontology%2FSNOMEDCT%2F'+snomed_id,
		headers: {
			'Authorization': 'apikey token=82d9fedd-2a62-4535-befc-6c59afdba6b7',
			'Accept': 'application/json'
		}
	};
	request(options, function(error, reponse, body) {
		var json = JSON.parse(body);
		console.log(json.cui);
	});

}

function getCuiLocal(snomed_id, callback) {
	redisClient.get(snomed_id, function (err,value) {
		callback(value);
	});
	// console.log("Get local");
	// db_snomed_cui.find({snomed:snomed_id}, function (err, docs) {
	// 	callback(docs);
	// console.log(docs);

}

function getDrugsLinkedtoCui(snomed_cui, callback) {
	redisClient.smembers(snomed_cui, function (err, value) {
		callback(value);
	});
}

function linkSnomedToCui(callback) {
	var results;
	var options = {
		url: 'http://dbs.kevindalleau.fr/sparql?query=select%20DISTINCT%20%3Fpathology%0AWHERE%20%7B%0A%0A%3Fa%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3Aassertion%3E%20%3Flink%20%20.%0A%3Fa%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3AVariant_Gene%3E%20%3Fvariant_gene.%0A%3Fvariant_gene%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3Ax-gene%3E%20%3Fgene.%0A%3Fa%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3AVariant_Phenotype%3E%20%3Fphenotype.%0A%3Fphenotype%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3Ax-snomed_ct%3E%20%3Fpathology.%0A%7D%0A%0A&default-graph-uri=http://dbs.kevindalleau.fr:8890/DAV/clinvar',
		headers: {
			'Accept': 'application/json'
		}
	};

	function iterate_calculus(i,results,callback) { // Pour boucler sur des callbacks

		if(i<results.length) {
			if(results[i].hasOwnProperty('pathology')) {
				snomed_id = results[i].pathology.value.substring(28);
				callback(snomed_id);
				iterate_calculus(i+1,results, callback);
			}

		// 	if('pathology' in results[i]) {
		// 		var snomed_id = results[i].pathology.value.substring(28);
		// 		callback(snomed_id);
		// 	}
		//

		}

	}
	request(options, function(error, reponse, body) {
		var json = JSON.parse(body);
		results = json.results.bindings;
		iterate_calculus(0,results, callback);


	});
}
function getGeneToOnlySnomed() {
	var options = {
		url: 'http://dbs.kevindalleau.fr/sparql?query=select%20DISTINCT%20%3Fpathology%0AWHERE%20%7B%0A%0A%3Fa%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3Aassertion%3E%20%3Flink%20%20.%0A%3Fa%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3AVariant_Gene%3E%20%3Fvariant_gene.%0A%3Fvariant_gene%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3Ax-gene%3E%20%3Fgene.%0A%3Fa%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3AVariant_Phenotype%3E%20%3Fphenotype.%0A%3Fphenotype%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3Ax-snomed_ct%3E%20%3Fpathology.%0A%7D%0A%0A&default-graph-uri=http://dbs.kevindalleau.fr:8890/DAV/clinvar',
		headers: {
			'Accept': 'application/json'
		}
	};
	request(options, function(error, reponse, body) {
		var json = JSON.parse(body);
		var results = json.results.bindings;
		for(key in results) {
			console.log(results[key].pathology.value.substring(28));

		}

	});
}

function iterateGeneToSnomed(i,data, callback) {
	if(i<data.length) {
		var individual = new Object();
		individual.gene = data[i].gene.value.substr(29);
		individual.link = data[i].link.value;
		individual.pathology =  data[i].pathology.value.substr(28);

		getCuiLocal(individual.pathology, function(data1){
			individual.cui = data1;
			callback(individual);
		});
		iterateGeneToSnomed(i+1, data,callback)

	}

}

// function getSiderCui(pathology_cui, callback) {
//
// }
function getGeneToSnomedLink() {
	var options = {
		url: 'http://dbs.kevindalleau.fr/sparql?query=select%20DISTINCT%20%3Fgene%20%3Flink%20%3Fpathology%0AWHERE%20%7B%0A%0A%3Fa%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3Aassertion%3E%20%3Flink%20%20.%0A%3Fa%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3AVariant_Gene%3E%20%3Fvariant_gene.%0A%3Fvariant_gene%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3Ax-gene%3E%20%3Fgene.%0A%3Fa%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3AVariant_Phenotype%3E%20%3Fphenotype.%0A%3Fphenotype%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3Ax-snomed_ct%3E%20%3Fpathology.%0A%7D%0A%0A&default-graph-uri=http://dbs.kevindalleau.fr:8890/DAV/clinvar',
		headers: {
			'Accept': 'application/json'
		}
	};
	request(options).pipe(JSONStream.parse('*.bindings')).on('data', function(data){
		iterateGeneToSnomed(0,data,function(data){
			console.log(data);
		})
		// console.log(data.link);
		// console.log(data.pathology);
	});
}



function iterateGeneToDrugs(i,data, callback) {
	if(i<data.length) {
		var individual = new Object();
		individual.gene = data[i].gene.value.substr(29);
		individual.link = data[i].link.value;
		individual.pathology =  data[i].pathology.value.substr(28);



		getCuiLocal(individual.pathology, function(data1){


			individual.cui = data1;
			individual.drugs = '1';
				getDrugsLinkedtoCui(individual.cui, function(data2){
					if(data2!=null) {
						individual.drugs = data2;
					}
					if(individual.drugs[0] != null)
					{
						callback(individual);
					}
					else {
						callback(null);
					}
				})



		});
		iterateGeneToDrugs(i+1, data,callback)

	}
}
function getGeneToDrugs() { //Main purpose of the code : get links between genes and drugs
	var options = {
		url: 'http://dbs.kevindalleau.fr/sparql?query=select%20DISTINCT%20%3Fgene%20%3Flink%20%3Fpathology%0AWHERE%20%7B%0A%0A%3Fa%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3Aassertion%3E%20%3Flink%20%20.%0A%3Fa%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3AVariant_Gene%3E%20%3Fvariant_gene.%0A%3Fvariant_gene%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3Ax-gene%3E%20%3Fgene.%0A%3Fa%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3AVariant_Phenotype%3E%20%3Fphenotype.%0A%3Fphenotype%20%3Chttp%3A%2F%2Fbio2rdf.org%2Fclinvar_vocabulary%3Ax-snomed_ct%3E%20%3Fpathology.%0A%7D%0A%0A&default-graph-uri=http://dbs.kevindalleau.fr:8890/DAV/clinvar',
		headers: {
			'Accept': 'application/json'
		}
	};
	var stream = request(options).pipe(JSONStream.parse('*.bindings'));
	stream.on('data', function(data){
		// iterateGeneToSnomed(0,data, function(output) {
		// 	console.log(output);
		// });

		iterateGeneToDrugs(0,data,function(data3){
			if(data3 != null) {
				for(i in data3.drugs) {
					var output = data3.gene + ";" + data3.link + ";" + data3.cui + ";" + data3.drugs[i]+"\n";
					console.log(output);
					fs.appendFileSync('./testResult.json', output)//, function(err) {
						//if(err) {
							//console.log(err);
						//}
					//})
				}

			// var output = JSON.stringify(data3);
			// console.log(data3);


		}
		})
		// console.log(data.link);
		// console.log(data.pathology);
	});
	// stream.on('end', function() {
	// 	console.log("Requête renvoyée avec succès");
	// })

}

function getGeneRelationSnomed(callback) {
	var endpoint = 'http://dbs.kevindalleau.fr/sparql';
	var query = 'SELECT ?gene ?link ?pathology WHERE {'+
	'?a <http://bio2rdf.org/clinvar_vocabulary:assertion> ?link.'+
	'?a <http://bio2rdf.org/clinvar_vocabulary:Variant_Gene> ?variant_gene.'+
	'?variant_gene <http://bio2rdf.org/clinvar_vocabulary:x-gene> ?gene.'+
	'?a <http://bio2rdf.org/clinvar_vocabulary:Variant_Phenotype> ?phenotype.'+
	'?phenotype <http://bio2rdf.org/clinvar_vocabulary:x-snomed_ct> ?pathology. '+
	'} LIMIT 20';
	// var query = 'select DISTINCT ?gene ?link ?pathology WHERE { ?a <http://bio2rdf.org/clinvar_vocabulary:assertion> ?link. ?a <http://bio2rdf.org/clinvar_vocabulary:Variant_Gene> ?variant_gene. ?variant_gene <http://bio2rdf.org/clinvar_vocabulary:x-gene> ?gene. ?a <http://bio2rdf.org/clinvar_vocabulary:Variant_Phenotype> ?phenotype. ?phenotype <http://bio2rdf.org/clinvar_vocabulary:x-snomed_ct> ?pathology. } LIMIT 20';
	var client = new SparqlClient(endpoint);
	client.query(query).execute(function(error, results) {
	    var binding = results.results.bindings;
	    if(binding) {
	    	callback(binding);
	    }
	    else {
	    	callback(0);
	    }
	});
}


program
  .version('0.0.1')

program.command('getcui <snomedct_id>')
	 .description('Get the cui of a given snomedct id')
	 .action(function(snomedct_id){
	   env = snomedct_id || 'all';
	   getCui(env);
});

program.command('generatelist <param>')
  .description('Generate links between genes and drugs')
  .action(function(param){
		console.log(param);
		if(param == "snomed") {
			getGeneToOnlySnomed();
		}
		else if(param == "snomed_local") {
			getCuiLocal(129778000, function(data){
				console.log(data);
			});
		}
		else if(param == "snomed_to_drugs") {
			getDrugsLinkedtoCui("C0348343", function(data){
				console.log(data);
			});
		}
		else if(param == "linksnomedcui") {
			linkSnomedToCui(function (value) {
				getCui(value);
			});
		}
		else if(param == "gene_to_snomed") {
			getGeneToSnomedLink();
		}
		else if(param == "all") {
			getGeneToDrugs();
		}

    // console.log(getGeneRelationSnomed(function(data) {
		// 	console.log(data);
		// }), env);
  });

program.parse(process.argv);
