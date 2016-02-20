var raml = require('./lib/raml.js');
var file = require('./lib/file.js');
var fs = require('fs');
var utils = require('utils')._;

var ramlParser = new raml('test/api.raml');

var resources = ramlParser.routes();

utils.each(resources, function(route){
	var text = '',
	tab = "\t",
	methods = ramlParser.methods(route),
	routes = [];

	var script = new file();

	script.directory = 'test/routes';
	script.setName(route);

	utils.each(methods, function(method){
		t = '';
		t += route + '.' + method + "(function($){\n";
		t += tab + "//your code here\n";
		t += "});";

		routes.push(t);
	});

	script.addContent(routes.join("\n\n"));

	script.build();
});