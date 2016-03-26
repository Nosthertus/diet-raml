var raml = require('raml-parser'),
	path = require('path'),
	deasync = require('deasync');

function ramlParser(file, absolute){
	if(absolute)
		this._file = path.resolve(file);

	else
		this._file = file

	this.api = loadFile(this._file);
}

ramlParser.prototype.resources = function() {
	var resources = [];

	var r = this.api.resources;

	for(i in r){
		var res = r[i];

		resources.push(this.toSimpleJSON(res));
	}

	return resources;
};

ramlParser.prototype.childResources = function(resource) {
	var resources = [];

	var res = resource.resources;

	for(i in res){
		var r = res[i];

		resources.push(this.toSimpleJSON(r));
	}

	return resources;
};

ramlParser.prototype.getResourceName = function(uri) {
	var regex = /(\w+(\-|\_)\w+|\w+)/;

	return uri.match(regex)[1];
};

ramlParser.prototype.getCompleteRelativeUri = function(resource) {
	return null;
};

ramlParser.prototype.getUriParameters = function(resource) {
	return null;
};

ramlParser.prototype.getMethods = function(resource) {
	var methods = [];

	var m = resource.methods;

	for(i in m)
		methods.push(m[i].method)

	return methods;
};

ramlParser.prototype.toSimpleJSON = function(resource) {
	return {
		name: this.getResourceName(resource.relativeUri),
		relativeUri: resource.relativeUri,
		completeRelativeUri: this.getCompleteRelativeUri(resource),
		allUriParameters: this.getUriParameters(resource),
		methods: this.getMethods(resource),
		childs: this.childResources(resource)
	};
};


function loadFile(file){
	var sync = true;
	var api = null;

	raml.loadFile(file).then(function(data){
		api = data;
		sync = false;
	});

	while(sync)
		deasync.sleep(100);

	return api;
}

module.exports = ramlParser;