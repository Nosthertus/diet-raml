var raml = require('raml-1-parser');
var path = require('path');

/**
 * Instantiate object contstruct
 * @param  {String} file The directory of the raml file
 */
var ramlParser = function(file, absolute){
	if(absolute)
		this._file = path.resolve(file);

	else
		this._file = path.resolve(__dirname, '../', file);		

	this.api = raml.loadApiSync(this._file);
};

/**
 * Get all routes from the root
 * this means that all child resources are ignored
 * 
 * @return {Array} The list of all root resources
 */
ramlParser.prototype.routes = function () {
	var resources = [];

	var res = this.api.resources();

	for(i in res){
		var r = res[i].relativeUri().value();

		resources.push({
			name: r.split('/')[1],
			relativeUri: r,
			childs: this.childResouces(res[i])
		});
	}

	return resources;
};

ramlParser.prototype.resources = function(){
	var resources = [];

	var r = this.api.resources();

	for(i in r){
		var res = r[i];

		resources.push(this.toSimpleJSON(res));
	}

	return resources;
};

ramlParser.prototype.childResouces = function(resource) {
	var resources = [];

	var parentName = resource.relativeUri().value();

	var res = resource.resources();

	for(i in res){
		var r = res[i];

		resources.push(this.toSimpleJSON(r));
	}

	return resources;
};

/**
 * Get a single resource with the provided route name
 * 
 * @param  {String} name The name of the route
 * @return {Resource}      The resource object instance
 */
ramlParser.prototype.resource = function(name) {
	var res = this.api.resources();

	for(i in res){
		var r = res[i].relativeUri().value();
		var n = r.split('/')[1];

		if(n == name)
			return res[i];
	}
};

/**
 * Get all methods inside a given route name
 * 
 * @param  {Interface} resource The interface of the route resource
 * @return {Array}            	The list of all methods in a route
 */
ramlParser.prototype.methods = function(resource){
	var methods = [];

	var m = resource.methods();

	for(i in m){
		methods.push(m[i].method())
	}

	return methods;
};

ramlParser.prototype.toSimpleJSON = function(resource){
	return {
		name: resource.relativeUri().value().split('/')[1],	
		relativeUri: resource.relativeUri().value(),
		completeRelativeUri: resource.completeRelativeUri(),
		methods: this.methods(resource),
		childs: this.childResouces(resource)
	};
};

module.exports = ramlParser;