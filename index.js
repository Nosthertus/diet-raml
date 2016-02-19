var raml = require('./lib/raml.js');
var fs = require('fs');
var utils = require('utils')._;

var ramlParser = new raml('test/api.raml');

var resources = ramlParser.routes();

utils.each(resources, function(route){
	var text = '',
	tab = "\t",
	methods = ramlParser.methods(route),
	routes = [];

	utils.each(methods, function(method){
		t = '';
		t += route + '.' + method + "(function($){\n";
		t += tab + "//your code here\n";
		t += "});";

		routes.push(t);
	});

	text = routes.join("\n\n");

	fs.mkdir('test/routes', function(){
		fs.writeFile('test/routes/' + route + '.js', text, function(err){
			if(err)
				throw err;

			console.log('file:', route, 'successfully written');
		});
	});

});