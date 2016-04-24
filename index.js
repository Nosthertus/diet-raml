#!/usr/bin/env node

var raml = require('./lib/raml.js');
var file = require('./lib/file.js');
var fs = require('fs');
var utils = require('utils')._;
var argv = require('minimist')(process.argv.slice(2));
var dietUtils = require('./lib/diet.js');
var coder = require('./lib/coder.js');

var ramlParser = new raml(argv.t, false);

var resources = ramlParser.resources();
var errors = ramlParser.allStatusErrors();

utils.each(resources, function(resource){
	var text = '',
	tab = "\t",
	routes = [];

	console.log('Generating resources:', resource.name);

	var script = new file();

	script.directory = argv.d;

	script.setName(resource.name);

	routes = buildRoutes(resource);

	script.addContent(routes.join("\n\n"));

	script.inFunction = true;

	script.build();
});

generateErrors(errors);
generateErrorHandler();
generateIndex();

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
	console.log('Generating: Error JSON file')
	var errorStr = JSON.stringify(coder.parseErrors(errors));

	var script = new file();

	script.directory = argv.d;
	script.setName('errors.json');

	script.addContent(coder.indentCode(errorStr));

	script.build();
}

function generateErrorHandler(){
	console.log('Generating: Error Handler file');
	var script = new file();

	script.directory = argv.d;
	script.setName('errorHandler');

	script.addContent(coder.errorHandler());

	script.build();
}

function generateIndex(){
	console.log('Generating: Index file');
	var script = new file();

	var index = {
		errors: '',
		requires: ''
	};

	script.directory = argv.d;
	script.setName('index');

	utils.each(resources, function(resource){
		index.requires += "require('./" + resource.name + "');\n";
	});

	index.errors = coder.indentCode('var methodStatus = ' + JSON.stringify(coder.parseErrors(errors, true)) + ';');

	for(code in index)
		script.addContent(index[code] + '\n\n');

	script.build();
}