var raml = require('raml-parser');

module.exports = function(file){
	var api = raml.loadFile(file);

	return api;
}