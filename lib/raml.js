var raml1 = require('./raml-1.0.js'),
	raml08 = require('./raml-0.8.js'),
	fs = require('fs'),
	promise = require('bluebird');

function RAML(file){
	this.version = getVersion(file);

	if(this.version == '0.8')
		this.api = raml08(file);

	if(this.version == '1.0')
		this.api = new raml1(file);
}

function getVersion(file){
	var data = fs.readFileSync(file, 'utf8');
	var lines = data.split('\n');

	var re = /#%RAML\s(.*)/m;

	return lines[0].match(re)[1];
}

RAML.prototype.resources = function() {
	if(this.version == '0.8'){
		return this.api.then(function(data){
			return data.resources;
		})
	}

	if(this.version == '1.0'){
		return new promise(function(resolve, reject){
			resolve(this.api.resources());
		})
	}
};

module.exports = RAML;