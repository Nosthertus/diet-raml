var raml = require('raml-parser'),
	path = require('path'),
	deasync = require('deasync'),
	_       = require("utils-pkg");

/**
 * Object function instance
 * 
 * @param  {String}  file     Directory of the file
 * @param  {Boolean} absolute Conditional to resolve absolute directory
 */
function ramlParser(file, absolute){
	if(absolute)
		this._file = path.resolve(file);

	else
		this._file = file

	this._currentUri    = ''; /*The temporal complete relative uri*/
	this._uriParameters = {}; /*The whole temporal parameters from a root resource*/
	this._errorStatus	= {};
	this.api            = loadFile(this._file); /*The whole api content*/
}

ramlParser.prototype.getApi = function() {
	return this.api;
};

ramlParser.prototype.getTraits = function() {
	var traits = {};

	for (var i = 0; i < this.api.traits.length; i++) {
		var obj = this.api.traits[i];

		var name = Object.keys(obj)[0];

		traits[name] = obj[name];
	}

	return traits;
};

/**
 * Get all root resources
 * 
 * All temporal resources are defined and resets
 * for each resource iteration
 */
ramlParser.prototype.resources = function() {
	var resources = [];

	var r = this.api.resources;

	for(i in r){
		var res = r[i];

		resources.push(this.toSimpleJSON(res));
		this.clean();
	}

	return resources;
};

ramlParser.prototype.parsedObject = function() {
	return this.api;
};

/**
 * Get all sub-resources from a given resource
 * 
 * @param  {Object} resource The current resource
 * @param  {String} uri		 The current uri from root
 * @return {Array}	         All sub-resources
 */
ramlParser.prototype.childResources = function(resource, uri) {
	var resources = [];

	var res = resource.resources;

	for(i in res){
		var r = res[i];

		resources.push(this.toSimpleJSON(r, uri));
	}

	return resources;
};

/**
 * Resets all temporal properties
 */
ramlParser.prototype.clean = function(){
	this._uriParameters = {};
	this._currentUri = '';
};

/**
 * Gather all schemas from RAML file
 * 
 * @return {Array} The list of all schemas
 */
ramlParser.prototype.schemas = function(){
	return this.api.schemas;
};

/**
 * Set current uri resource
 * This will concatenate the uri with the parent uris
 *
 * @param {Object} resource The current resource
 */
ramlParser.prototype.setCurrentUri = function(resource){
	this._currentUri += resource.relativeUri;
};

/**
 * Store all errors from the resource in a global variable
 * 
 * @param {Object} resource The current resource
 */
ramlParser.prototype.setErrors = function(resource){
	var methods = resource.methods;

	for(m in methods){
		var responses = methods[m].responses;

		var found = false;

		for(method in this._errorStatus){
			if(methods[m].method == method){
				found = true;
				break;
			}
		}

		if(!found)
			this._errorStatus[methods[m].method] = {};

		for(r in responses){
			if(r >= 400)
				this._errorStatus[methods[m].method][r] = responses[r];
		}
	}
};

/**
 * Get the current resource name
 * 
 * @param  {String} uri The current uri resource
 * @return {String}     The actual name of the resource
 */
ramlParser.prototype.getResourceName = function(uri) {
	var regex = /(\w+(\-|\_)\w+|\w+)/; /*Expression format for resource name*/

	return uri.match(regex)[1];
};

/**
 * Get the status responses from a resource
 * 
 * @param  {Object} resource The current resource
 * @return {Object}          List of all status from the resource
 */
ramlParser.prototype.getResponses = function(resource){
	var methods = resource.methods;

	var responses = {};

	for(m in methods){
		var method = methods[m];

		var res = method.responses;

		for(response in res)
			responses[response] = res[response];
	}

	return responses;
};

/**
 * Get the whole complete relative uri
 * from the root resource
 *
 * @param  {Object} resource  The current resource
 * @param  {String} uri		  The string of current uri from root
 * @return {String}           The complete relative uri from root resource
 */
ramlParser.prototype.getCompleteRelativeUri = function(resource, uri){
	if(!uri)
		return resource.relativeUri;

	else
		return uri + resource.relativeUri;
};

/**
 * Get all parameters from a resource
 * This is only for resources that contains uri parameters
 * from their heirarchy parents 
 *
 * @param  {Object} resource The current resource
 * @return {Object}          All uri parameters
 */
ramlParser.prototype.getUriParameters = function(resource) {
	if(resource.uriParameters){
		var parameters = resource.uriParameters;

		for(k in parameters){
			this._uriParameters[k] = parameters[k];
		}
	}

	return this._uriParameters;
};

/**
 * Get all methods from a resource
 * 
 * @param  {Object} resource The current resource
 * @return {Array}           The list of all methods
 */
ramlParser.prototype.getMethods = function(resource) {
	var methods = [];

	var m = resource.methods;

	for(i in m){
		var details = {
			method: m[i].method,
			queryParameters: m[i].queryParameters,
			description: m[i].description,
			traits: []
		};

		if(m[i].method == 'post' && m[i].body['application/json']){
			if(_.inKeyObject(m[i].body['application/json'], "schema") && _.isJSON(m[i].body['application/json'].schema)){
				details.schema = JSON.parse(m[i].body['application/json'].schema);
			}

			else{
				var name = resource.relativeUriPathSegments; // name of the current resource

				console.error("ERROR: \"" + name + "\" resource does not valid schema for " + details.method + " method.");
				details.schema = {};
			}
		}

		if(m[i].is){
			details.traits = details.traits.concat(m[i].is[1], Object.keys(m[i].is[0]));			
		}

		methods.push(details);
	}

	return methods;
};

/**
 * Parse to simple JSON from a resource
 * 
 * @param  {Object} resource The current resource
 * @param  {String} uri		 The string of the current uri from route
 * @return {Object}          The JSON simplified of the resource
 */
ramlParser.prototype.toSimpleJSON = function(resource, uri){
	this.setCurrentUri(resource);

	this.setErrors(resource);

	return {
		name: this.getResourceName(resource.relativeUri),
		relativeUri: resource.relativeUri,
		completeRelativeUri: uri = this.getCompleteRelativeUri(resource, uri),
		allUriParameters: this.getUriParameters(resource),
		methods: this.getMethods(resource),
		responses: this.getResponses(resource),
		childs: this.childResources(resource, uri)
	};
};

/**
 * Get all errors status from all sub-resources
 * 
 * @return {Object} The list of all errors
 */
ramlParser.prototype.allStatusErrors = function(){
	return this._errorStatus;
};

/**
 * Load a raml file from a directory
 * The function extracts the data from the promise parser
 * and then returns the api object after it was resolved
 * 
 * @param  {String} file The directory of the file
 * @return {Object}      The whole api object
 */
function loadFile(file){
	var sync = true;
	var api = null;

	raml.loadFile(file)
		.then(function(data){
			api = data;
			sync = false;
		})
		.catch(function(err){
			console.log(err.message);
			process.exit(1);
		})

	while(sync)
		deasync.sleep(100);

	return api;
}

module.exports = ramlParser;