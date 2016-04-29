var fs = require('fs');
var path = require('path');

/**
 * Function object of file instance
 */
var file = function(){
	this.path = '';
	this.name = '';
	this.content = "";
}

/**
 * Whether if code should be encapsulated in module.exports function
 * 
 * @type {Boolean}
 */
file.inFunction = false;

/**
 * Whether if code should add a dependecy require for errorHandler.js
 * 
 * @type {Boolean}
 */
file.requireErrorHandler = false;

/**
 * The folder where the code will be generated
 * 
 * @type {String}
 */
file.directory = 'test';

/**
 * Whether if the directory already exists, this avoids warning error
 * 
 * @type {Boolean}
 */
file.directoryExist = false;

/**
 * Set the name of the file, will have js extension if extension
 * is not provided with the name
 * 
 * @param {String} name The name of the file
 */
file.prototype.setName = function(name){
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
file.prototype.addContent = function(content) {
	this.content += content;
};

/**
 * Creates the file with the options and content added
 */
file.prototype.build = function(){
	var file = path.parse(this.path);
	var content;

	// Encapsulate code if inFuction is true
	if(this.inFunction)
		content = encapsulate(this.content, this.requireErrorHandler);

	else
		content = this.content;

	createDir(file.dir, function(){
		fs.writeFile(path.join(file.dir, file.base), content, function(err){
			if(err)
				throw err;

			return true;
		});
	});
};

/**
 * Create the directory if directory does not exists
 * 
 * @param  {String}   dir      The directory to create
 * @param  {Function} callback Callback function after code has executed
 */
function createDir(dir, callback){
	fs.access(dir, fs.F_OK, function(err){
		if(err  && !file.directoryExist){
			file.directoryExist = true;
			fs.mkdirSync(dir);
		}
	
		callback();
	});
}

/**
 * Encapsulate content of the file in module.exports function
 * @param  {String}  content      The content to encapsulate
 * @param  {Boolean} errorHandler Whether if set require to errorHandler.js
 * @return {String}               The encapsulated code
 */
function encapsulate(content, errorHandler){
	var text = '';
	var lines = content.split('\n');

	var script = '';

	for(l in lines)
		script += '\t' + lines[l] + '\n';
	
	if(errorHandler)
		text += "var errorHandler = require('./errorHandler.js');\n\n";
	
	text += 'module.exports = function(app){\n';
	text += script;
	text += '};';

	return text;
}

module.exports = file;