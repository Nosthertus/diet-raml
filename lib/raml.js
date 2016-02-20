var raml = require('raml-1-parser');
var path = require('path');

/**
 * Instantiate object contstruct
 * @param  {String} file The directory of the raml file
 */
var ramlParser = function(file){
	this._file = file;

	this.api = raml.loadApiSync(path.resolve(__dirname, '../', this._file));
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

		resources.push(r.split('/')[1]);
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
 * @param  {String} routeName The name of the route
 * @return {Array}            The list of all methods in a route
 */
ramlParser.prototype.methods = function(routeName){
	var m = this.resource(routeName).methods();

	var methods = [];

	for(i in m){
		methods.push(m[i].method());
	}

	return methods;
};

module.exports = ramlParser;