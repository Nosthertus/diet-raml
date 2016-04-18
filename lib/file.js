var fs = require('fs');
var path = require('path');

var file = function(){
	this.path = '';
	this.name = '';
	this.content = "";
}

file.directory = 'test';

file.directoryExist = false;

file.prototype.setName = function(name){
	this.name = name;
	this.path = path.join(this.directory, this.name + '.js');
};

file.prototype.addContent = function(content) {
	this.content += content;
};

file.prototype.build = function(){
	var file = path.parse(this.path);
	var content = encapsulate(this.content);

	createDir(file.dir, function(){
		fs.writeFile(path.join(file.dir, file.base), content, function(err){
			if(err)
				throw err;

			return true;
		});
	});
};

function createDir(dir, callback){
	fs.access(dir, fs.F_OK, function(err){
		if(err  && !file.directoryExist){
			file.directoryExist = true;
			fs.mkdirSync(dir);
		}
	
		callback();
	});
}

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

module.exports = file;