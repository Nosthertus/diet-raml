var hat       = require("hat");
var os        = require("os");
var path      = require("path");
var flutils   = require("flutils");
var _         = require("utils-pkg");
var utils     = require("utils")._;
var util      = require("util");
var raml      = require("./raml");
var coder     = require("./coder");
var dietUtils = require("./diet");
var file      = require("./file");
var EventEmitter = require("eventemitter2").EventEmitter2;

function Generator(opts) {
	Object.assign(this, parseOpts(opts));

	this._ramlParser = new raml(this.raml_file, false);

	this._ramlErrors = null;

	EventEmitter.call(this);
};

util.inherits(Generator, EventEmitter);

Generator.prototype.$hash = hat();

Generator.prototype.$config = flutils.loadJSON(path.resolve("config.json"));

Generator.prototype.getTemporaryDirectory = function() {
	return path.join(os.tmpdir(), "diet-raml-generator-" + this.$hash);
};

Generator.prototype.generate = function(func) {
	if(!_.isString(func)){
		throw new Error("generate parameter type is not valid");
	}

	else if(func == "resources"){
		this.generateResources();
	}

	else if(func == "errors"){
		this.GenerateErrors();
	}

	else{
		throw new Error("generation function does not exists");
	}
};

Generator.prototype.generateResources = function() {
	var self = this;

	self.emit("start", "resources");
	self.emit("resources.start");

	var resources = self._ramlParser.resources();
	self._ramlErrors = self._ramlParser.allStatusErrors();

	_.each(resources, function(index, resource, next){
		var text = '',
		tab = "\t",

		routes = [];

		self.emit("resources.start.resource", resource);

		var script = new file();

		script.directory = path.join(self.directory, self.$config.directory.routes);

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
		self.emit("resources.done");
	});
};

Generator.prototype.GenerateErrors = function() {
	var self = this;

	// Load errors if they are not loaded yet
	if(_.isFalsy(self._ramlErrors)){
		self._ramlParser.resources();
		self._ramlErrors = self._ramlParser.allStatusErrors();
	}

	var errors = self._ramlErrors;

	self.emit("start", "Error JSON");
	self.emit("start.error");
	
	var errorStr = JSON.stringify(coder.parseErrors(errors));

	var script = new file();

	script.directory = path.join(self.directory, self.$config.directory.errors);
	script.setName('errors.json');

	script.addContent(coder.indentCode(errorStr));

	script.build();

	script.on("done", function(){
		self.emit("done", "Error JSON");
		self.emit("done.error");
	})
};

function parseOpts(opts){
	var def = {
		directory: null,
		raml_file: null
	};

	if(opts.argv){
		def.directory = opts.argv.d;
		def.raml_file = opts.argv.t;
		def.compress_zip = opts.argv.z;
	}

	for(k in opts){
		if(def.hasOwnProperty(k)){
			def[k] = opts[k];
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