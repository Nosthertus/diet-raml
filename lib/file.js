var util         = require("util");
var fs           = require('fs');
var path         = require('path');
var coder        = require('./coder.js');
var mkdir        = require("mkdirp");
var EventEmitter = require("eventemitter2").EventEmitter2;

/**
 * Function object of file instance
 */
var File = function(obj){
	var obj = obj || {};

	this.path = '';
	this.name = '';
	this.content = "";
	this.generateErrors = obj.generateErrors || false;

	EventEmitter.call(this);
}

/*
 * Merge File construct with EventEmmiter construct
 */
util.inherits(File, EventEmitter);

/**
 * Whether if code should be encapsulated in module.exports function
 * 
 * @type {Boolean}
 */
File.inFunction = false;

/**
 * Whether if code should add a dependecy require for errorHandler.js
 * 
 * @type {Boolean}
 */
File.requireErrorHandler = false;

/**
 * Whether the code is being written from a resource
 * 
 * @type {Boolean}
 */
File.fromResource = false;

/**
 * The folder where the code will be generated
 * 
 * @type {String}
 */
File.directory = 'test';

/**
 * Whether if the directory already exists, this avoids warning error
 * 
 * @type {Boolean}
 */
File.directoryExist = false;

/**
 * List of dependencies on a file
 * 
 * @type {Object}
 */
File._dependencies = {};

/**
 * Whether if this instance has dependencie listed
 * @type {Boolean}
 */
File.hasDependencies = false;

/**
 * Set the name of the file, will have js extension if extension
 * is not provided with the name
 * 
 * @param {String} name The name of the file
 */
File.prototype.setName = function(name){
	var file;

	// Verify if has extension
	if(path.extname(name) == ''){
		this.name = name;
		file = name + '.js';
	}

	else{
		this.name = path.parse(name).name;
		file = name;
	}

	this.path = path.join(this.directory, file);
};

/**
 * Add the content to the generated file, this concatenates with the 
 * current content in generated file
 * 
 * @param {String} content The content to be added
 */
File.prototype.addContent = function(content) {
	this.content += content;
};

/**
 * Add a dependency in list of dependencies
 * 
 * @param {Object} dependecy The name of the dependecy
 */
File.prototype.addDependecy = function(dependecy) {
	for(name in dependecy){
		this._dependencies[name] = dependecy[name];
	}

	this.hasDependencies = true
};

/**
 * Creates the file with the options and content added
 */
File.prototype.build = function(){
	var self = this;
	var file = path.parse(self.path);
	var content = self.content;

	// Encapsulate code if inFuction is true
	if(self.inFunction)
		content = encapsulate(content);

	// Write dependencies
	content = self._writeDependencies(content);

	// Create directory
	mkdir(file.dir, function(){
		fs.writeFile(path.join(file.dir, file.base), content, function(err){
			if(err){
				throw err;
			}
			else{
				self.emit("done");
			}
		});
	});
};

/**
 * Write the require files on the top of the content
 * 
 * @param  {String} content The content to write the dependencies
 * @return {String}         The content with dependencies
 */
File.prototype._writeDependencies = function(content) {
	var dependencies = '';

	for(name in this._dependencies){
		var dependecy = {
			name: name,
			value: this._dependencies[name]
		};

		if(name.indexOf('.' > 0))
			dependecy.name = name.split('.')[0];

		dependencies += 'var ' + dependecy.name + ' = require(./' + dependecy.value + ');';
	}

	if(this.requireErrorHandler && !this.generateErrors){
		if(this.fromResource){
			dependencies += "var errorHandler = require('./../middleware/pre_errors');";
		}

		else{
			dependencies += "var errorHandler = require('./pre_errors');";
		}
	}

	content = dependencies + '\n\n' + content;

	return content;
};

/**
 * Encapsulate content of the file in module.exports function
 * 
 * @param  {String}  content      The content to encapsulate
 * @param  {Boolean} errorHandler Whether if set require to errorHandler.js
 * @return {String}               The encapsulated code
 */
function encapsulate(content){
	var text = '';
	var lines = content.split('\n');

	var script = '';

	for(l in lines)
		script += '\t' + lines[l] + '\n';
	
	text += 'module.exports = function(app){\n';
	text += script;
	text += '};';

	return text;
}

module.exports = File;