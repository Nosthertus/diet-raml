var hat          = require("hat");
var os           = require("os");
var path         = require("path");
var flutils      = require("flutils");
var _            = require("utils-pkg");
var utils        = require("utils")._;
var util         = require("util");
var raml         = require("./raml");
var coder        = require("./coder");
var dietUtils    = require("./diet");
var file         = require("./file");
var compressor   = require("./compressor");
var EventEmitter = require("eventemitter2").EventEmitter2;

function Generator(opts) {
	var options = Object.assign(this, parseOpts(opts));

	this._ramlParser;

	if(!options.raml_file){
		this._ramlParser = options.api;
	}

	else{
		this._ramlParser = new raml(options.raml_file, false);
	}

	this._ramlErrors = null;
	this._ramlResources = null;

	EventEmitter.call(this);
};

util.inherits(Generator, EventEmitter);

Generator.prototype.$hash = hat();

Generator.prototype.$config = flutils.loadJSON(path.resolve("config.json"));

Generator.prototype.$functions = [];

Generator.prototype.hasFunction = function(name){
	return this.$functions.indexOf(name) > -1;
}

Generator.prototype.getTemporaryDirectory = function() {
	return path.join(os.tmpdir(), "diet-raml-generator-" + this.$hash);
};

Generator.prototype.getDirectory = function() {
	if(this.compress_zip){
		return this.getTemporaryDirectory();
	}

	else{
		return this.directory;
	}
};

Generator.prototype.getApi = function() {
	return this._ramlParser.api;
};

Generator.prototype.generate = function(func) {
	var self = this;

	if(!_.isString(func) && !_.isArray(func)){
		throw new Error("generate parameter type is not valid");
	}

	else if(_.isString(func)){
		self.executeFunction(func);

		self.on("done."+func, function(){
			self.emit("finish");
		});
	}

	else if(_.isArray(func)){
		_.each(func, function(index, funct, next){
			self.on("done."+funct, function(){
				next();
			});

			self.executeFunction(funct);
		}, function(){
			self.emit("done", "generation");
			self.emit("done.generating");
		});
	}

	self.once("done.generating", function(){
		if(self.compress_zip){
			var name = path.parse(self.directory).name;

			compressor.zip({dir: self.getTemporaryDirectory(), name: name}, function(){
				self.emit("finish");
			});
		}

		else{
			self.emit("finish");
		}
	});
};

Generator.prototype.executeFunction = function(func) {
	switch(func){
		case "resources":
			this.generateResources();
			break;
		case "errors":
			this.generateErrors();
			break;
		case "pre_errors":
			this.generatePreErrors();
			break;
		case "header": 
			this.generateHeader();
			break;
		case "footer":
			this.generateFooter();
			break;
		case "schemas":
			this.generateSchemas();
			break;
		case "traits":
			this.generateTraits();
			break;
		default:
			throw new Error("\""+func+"\" generation function does not exist");
			break
	}
};

Generator.prototype.generateResources = function() {
	var self = this;

	self.emit("start", "resources");
	self.emit("start.resources");

	var resources = self._ramlResources = self._ramlParser.resources();
	self._ramlErrors = self._ramlParser.allStatusErrors();

	_.each(resources, function(index, resource, next){
		var text = '',
		tab = "\t",

		routes = [];

		self.emit("start.resources.resource", resource);

		var script = new file();

		script.directory = path.join(self.getDirectory(), self.$config.directory.routes);

		script.setName(resource.name);

		routes = buildRoutes(resource);

		script.addContent(routes.join("\n\n"));

		script.requireErrorHandler = true;
		script.inFunction = true;

		script.build();

		script.on("done", function(){
			next();
		});
	}, function(){
		self.emit("done", "resources");
		self.emit("done.resources");
	});
};

Generator.prototype.generateErrors = function() {
	var self = this;

	// Load errors if they are not loaded yet
	if(_.isFalsy(self._ramlErrors)){
		self._ramlParser.resources();
		self._ramlErrors = self._ramlParser.allStatusErrors();
	}

	var errors = self._ramlErrors;

	self.emit("start", "Error JSON");
	self.emit("start.errors");

	var errorStr = JSON.stringify(coder.parseErrors(errors));

	var script = new file();

	script.directory = path.join(self.getDirectory(), self.$config.directory.errors);
	script.setName('errors.json');

	script.addContent(coder.indentCode(errorStr));

	script.build();

	script.on("done", function(){
		self.emit("done", "Error JSON");
		self.emit("done.errors");
	})
};

Generator.prototype.generatePreErrors = function() {
	var self = this;

	self.emit("start", "Pre-Errors");
	self.emit("start.pre_errors");

	var script = new file();

	script.directory = path.join(self.getDirectory(), self.$config.directory.pre_errors);
	script.setName('pre_errors');

	script.addContent(coder.errorHandler());

	script.build();

	script.on("done", function(){
		self.emit("done", "Pre-Errors");
		self.emit("done.pre_errors");
	});
};

Generator.prototype.generateHeader = function() {
	var self = this;

	// Load resource object if they are not loaded yet
	if(_.isFalsy(self._ramlResources)){
		self._ramlResources = self._ramlParser.resources();
	}

	// Load errors if they are not loaded yet
	if(_.isFalsy(self._ramlErrors)){
		self._ramlParser.resources();
		self._ramlErrors = self._ramlParser.allStatusErrors();
	}

	self.emit("start", "header");
	self.emit("start.header");

	var resources = self._ramlResources;
	var errors = self._ramlErrors;

	var script = new file();

	var index = {
		errors: '',
		handler: '',
		requires: ''
	};

	script.directory = path.join(self.getDirectory(), self.$config.directory.header);
	script.setName('header');

	utils.each(resources, function(resource){
		index.requires += "require('./" + path.join(self.$config.directory.routes, resource.name) + "');\n";
	});

	index.errors = coder.indentCode('var methodStatus = ' + JSON.stringify(coder.parseErrors(errors, true)) + ';');
	
	index.handler = coder.loadTemplate('head_handler');

	for(code in index)
		script.addContent(index[code] + '\n\n');

	script.inFunction = true;
	script.requireErrorHandler = true;

	script.build();

	script.on("done", function(){
		self.emit("done", "header");
		self.emit("done.header");
	});
};

Generator.prototype.generateFooter = function() {
	var self = this;

	self.emit("start", "Footer");
	self.emit("start.footer");

	var script = new file();

	script.directory = path.join(self.getDirectory(), self.$config.directory.footer);
	script.setName('footer');

	script.addContent(coder.export(null, "function", "", ["$"]));

	script.build();

	script.on("done", function(){
		self.emit("done", "Footer");
		self.emit("done.footer");
	});
};

Generator.prototype.generateSchemas = function() {
	var self = this;

	var schemas = self._ramlParser.schemas();

	var dir = path.join(self.getDirectory(), self.$config.directory.schemas);

	// Schemas not found
	if(!schemas){
		console.log("WARNING: Schemas not found in RAML");
		self.emit("done.schemas");
		self.emit("done", "schemas");
	}

	else{
		self.emit("start", "schemas");
		self.emit("start.schemas");

		utils.each(schemas, function(schema){

			var script = new file();
			var name = new String;

			// Get the resource name from the schema data
			for(k in schema){
				name = k;
			}

			self.emit("start.schemas.schema", name);

			script.directory = dir;
			script.setName(name + ".json");

			script.addContent(schema[name]);

			script.build();

			script.on("done", function(){
				self.emit("done", "schemas");
				self.emit("done.schemas");
			});
		});
	}
};

Generator.prototype.generateTraits = function() {
	var self = this;

	self.emit("start", "traits");
	self.emit("start.traits");

	var dir = path.join(self.getDirectory(), self.$config.directory.traits);
	var traits = self._ramlParser.getTraits();

	var script = new file();

	script.directory = dir;
	script.setName("traits");

	var content = new String;

	_.each(traits, function(trait, value, next){
		var val = "";

		if(trait == "pageable"){
			val = dietUtils.writeHeaders({
				"X-Pagination-Total-Count": 0,
				"X-Pagination-Page-Count": 0,
				"X-Pagination-Current-Page": 1,
				"X-Pagination-Per-Page": 0
			});
		}

		content += coder.export(trait, "function", val);
		next();
	}, function(){
		script.addContent(coder.indentCode(content));
		script.build();
	});

	script.on("done", function(){
		self.emit("done", "traits");
		self.emit("done");
	});
};

function parseOpts(opts){
	var def = {
		directory: null,
		raml_file: null,
		compress_zip: false
	};

	if(_.isFalsy(opts)){
		throw new Error("Generator construct object is missing.");
		return;
	}

	else{
		if(opts.argv){
			def.directory = path.resolve(opts.argv.d);
			def.raml_file = path.resolve(opts.argv.t);
			def.compress_zip = opts.argv.z;
		}

		else if(_.isFalsy(opts.raml_file) && _.isFalsy(opts.api)){
			throw new Error("RAML file directory or api object is missing.");
			return;
		}

		else if(_.isFalsy(opts.directory)){
			throw new Error("Directory property is missing.");
			return;
		}

		else{
			for(k in opts){
				if(def.hasOwnProperty(k)){
					def[k] = opts[k];
				}
			}
		}
	}

	return def;
}

function buildRoutes(resource){
	routes = [];

	if(resource.methods.length > 0){
		utils.each(resource.methods, function(method){
			var code = dietUtils.parseUriParams(resource.completeRelativeUri);
			var route = coder.createRoute(code, method);
			routes.push(route);
		})
	}

	if(resource.childs.length > 0){
		utils.each(resource.childs, function(child){
			routes = routes.concat(buildRoutes(child));
		});
	}

	return routes;
}

module.exports = Generator;