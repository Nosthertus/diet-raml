#!/usr/bin/env node

var raml      = require('./lib/raml.js');
var file      = require('./lib/file.js');
var _         = require("utils-pkg");
var utils     = require('utils')._;
var argv      = require('./lib/args.js');
var dietUtils = require('./lib/diet.js');
var coder     = require('./lib/coder.js');
var path      = require('path');
var flutils   = require("flutils");

var config = flutils.loadJSON("config.json");

var ramlParser = new raml(argv.t, false);

var resources = ramlParser.resources();
var errors = ramlParser.allStatusErrors();

console.log("Directory selected:", argv.d);

_.each(resources, function(index, resource, next){
	var text = '',
	tab = "\t",
	routes = [];

	console.log('Generating resources:', resource.name);

	var script = new file();

	script.directory = path.join(argv.d, config.directory.routes);

	script.setName(resource.name);

	routes = buildRoutes(resource);

	script.addContent(routes.join("\n\n"));

	script.requireErrorHandler = true;
	script.inFunction = true;

	script.build();

	script.on("done", function(){
		next();
	});
});

generateErrors(errors);
generatePreErrors();
generateHeader();
generateSchemas();
generateTraits(ramlParser.getTraits());

function buildRoutes(resource){
	routes = [];

	if(resource.methods.length > 0){
		utils.each(resource.methods, function(method){
			var code = dietUtils.parseUriParams(resource.completeRelativeUri);
			var route = coder.createRoute(code, method);
			routes.push(route);
		})
	}

	if(resource.childs.length > 0){
		utils.each(resource.childs, function(child){
			routes = routes.concat(buildRoutes(child));
		});
	}

	return routes;
}

function generateErrors(errors){
	if(!argv.e){
		console.log('Generating: Error JSON file')
		var errorStr = JSON.stringify(coder.parseErrors(errors));

		var script = new file();

		script.directory = path.join(argv.d, config.directory.errors);
		script.setName('errors.json');

		script.addContent(coder.indentCode(errorStr));

		script.build();
	}
}

function generatePreErrors(){
	if(!argv.e){
		console.log('Generating: Pre-Error file');
		var script = new file();

		script.directory = path.join(argv.d, config.directory.pre_errors);
		script.setName('pre_errors');

		script.addContent(coder.errorHandler());

		script.build();
	}
}

/**
 * Generate Head file that connects to all Diet-RAML files
 */
function generateHeader(){
	if(!argv.n){
		console.log('Generating: Header file');
		var script = new file();

		var index = {
			errors: '',
			handler: '',
			requires: ''
		};

		script.directory = path.join(argv.d, config.directory.header);
		script.setName('header');

		utils.each(resources, function(resource){
			index.requires += "require('./" + path.join(config.directory.routes, resource.name) + "');\n";
		});

		index.errors = coder.indentCode('var methodStatus = ' + JSON.stringify(coder.parseErrors(errors, true)) + ';');
		
		index.handler = coder.loadTemplate('head_handler');

		for(code in index)
			script.addContent(index[code] + '\n\n');

		script.inFunction = true;
		script.requireErrorHandler = true;

		script.build();
	}
}

function generateSchemas(){
	if(argv.h){
		var schemas = ramlParser.schemas();

		var dir = path.join(argv.d, config.directory.schemas);

		console.log("Copying schemas to directory:", dir);

		utils.each(schemas, function(schema){

			var script = new file();
			var name = new String;

			// Get the resource name from the schema data
			for(k in schema){
				name = k;
			}

			console.log("Copying schema:", name);

			script.directory = dir;
			script.setName(name + ".json");

			script.addContent(schema[name]);

			script.build();
		})
	}
}

function generateTraits(traits){
	console.log("Generating: traits file");

	var dir = path.join(argv.d, config.directory.traits);

	var script = new file();

	script.directory = dir;
	script.setName("traits");

	var content = new String;

	_.each(traits, function(trait, value, next){
		content += coder.export(trait, "function", "");
		next();
	}, function(){
		script.addContent(coder.indentCode(content));
		script.build();
	});
}