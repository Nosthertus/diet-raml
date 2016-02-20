var fs = require('fs');
var path = require('path');

var file = function(){
	this.path = '';
	this.name = '';
	this.content = "";
}

file.directory = 'test';

file.prototype.setName = function(name){
	this.name = name;
	this.path = path.join(this.directory, this.name + '.js');
};

file.prototype.addContent = function(content) {
	this.content += content;
};

file.prototype.build = function(){
	var file = path.parse(this.path);
	var content = this.content;

	createDir(file.dir);
	fs.writeFile(path.join(file.dir, file.base), content, function(err){
		if(err)
			throw err;

		return true;
	});
};

function createDir(dir){
	fs.access(dir, fs.F_OK, function(err){
		if(err)
			fs.mkdirSync(dir);
	});

	return true;
}

module.exports = file;