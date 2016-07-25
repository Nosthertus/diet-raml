var beautify = require('js-beautify').js_beautify,
	path	 = require('path'),
	fs		 = require('fs'),
	comment  = require('node-commenter'),
	_        = require("utils-pkg");

module.exports = {
	/**
	 * Create a route string for generated code
	 * 
	 * @param  {String} uri    The current absolute uri route
	 * @param  {String} method The current method for the resource
	 * @return {String}        The indented code
	 */
	createRoute: function(uri, method){
		// TODO: Insert all required variables for all parameters in methods

		var t = '';
		t += this.comment({
			description: method.description || "Undefined",
			extra: {
				traits: method.traits
			}
		});

		t += 'app.' + method.method + "('" + uri + "', function($){\n";
		t += "//your code here\n";
		t += '});';

		return this.indentCode(t);
	},

	/**
	 * Create all error status with their message as JSON data
	 * 
	 * @param  {Object} status List of all status [status:data]
	 * @return {String}        The indented code
	 */
	createErrors: function(status){
		var t = '';

		t += 'function errorStatus($, status){';
		t += '$.status(status);';

		var list = parseErrors(status);

		t += '$status = ' + JSON.stringify(list) + ';';

		t += '$.errors = $status[status];';
		t += '$.failure();'

		return this.indentCode(t);
	},

	/**
	 * Parse all error status into simple Object
	 * 
	 * @param  {Object} methods    All the methods that contains error status
	 * @param  {Bool}   showMethod If parsed object must contain methods that contains errors as array
	 * @return {Object}            The simple error object
	 */
	parseErrors: function(methods, showMethod){
		var list = {};

		for(m in methods){
			var status = methods[m];

			if(showMethod)
				list[m] = [];

			for(key in status){
				if(key > 400){
					var data = status[key].body['application/json'].example;

					if(showMethod)
						list[m].push(key);
						
					else
						list[key] = JSON.parse(this.escapeChars(data));
				}
			}
		}

		return list;
	},

	/**
	 * Create code string for handling all error status
	 * @return {String} The error handler code
	 */
	errorHandler: function(){
		var t = '';

		t += "var fs = require('fs');";
		t += "var $status = JSON.parse(fs.readFileSync(__dirname + '/errors.json'));";
		t += '\n\n';

		t += 'module.exports = {';
		t += 'throwStatus: function(status, $){';
		t += 'var data = this.getStatus(status);';
		t += '$.status(data.status);';
		t += '$.errors = data;';
		t += '$.failure();';
		t += '},';
		t += 'getStatus: function(status){';
		t += 'return $status[status];';
		t += '}';
		t += '};';

		return this.indentCode(t);	
	},

	/**
	 * Load a script template from Template folder
	 * 
	 * @param  {String} file The name of the file template
	 * @return {String}      The loaded template file
	 */
	loadTemplate: function(file){
		var directory = path.join(__dirname, 'templates');

		return fs.readFileSync(path.join(directory, file + '.js'), 'utf8');
	},

	/**
	 * Indent the string for code format
	 * @param  {String} string The string of the code
	 * @return {String}        The indented string code
	 */
	indentCode: function(string){
		return beautify(string, {
			indent_char: '\t',
			indent_size: 1
		});
	},

	/**
	 * Escape special characters in a string
	 * 
	 * @param  {String} string The string to escape the characters
	 * @return {Stromg}        The string with escaped characters
	 */
	escapeChars: function(string){
		return string.replace(/\r\n/g, "");
	},

	/**
	 * Build a comment block
	 * @param  {String} string Text of the comment
	 * @return {String}        The text in a comment block
	 */
	comment: function(string){
		return comment.buildBlock(string);
	},

	export: function(name, type, value, params){
		var code = "module.exports." + name + " = ";

		if(type == "function"){
			code += "function(";

			if(!_.isFalsy(params) && _.isArray(params)){
				code += params.join(", ");
			}

			code += "){\n//Function code here\n" + value + "\nreturn;};"
		}

		else if(type == "property"){
			code += value + ";"
		}

		return this.indentCode(code);
	}
}
