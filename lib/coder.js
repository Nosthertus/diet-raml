var beautify = require('js-beautify').js_beautify;

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
		t += '/**\n';
		t += ' * ' + method.description + '\n';
		t += ' */\n';
		t += 'app.' + method.method + "('" + uri + "', function($){";
		t += 'var required = {';
		t += 'uriParameters: [],';
		t += 'queryParameters: [],';
		t += 'body: []';
		t += '};\n';
		t += "//your code here\n";
		t += '});';

		return this.indentCode(t);
	},

	/**
	 * Create all error status with their message as JSON data
	 * 
	 * @param  {Object} status List of all status [status:data]
	 * @return {[type]}        The indented code
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
	 * @param  {Object} methods All the methods that contains error status
	 * @return {Object}         The simple error object
	 */
	parseErrors: function(methods){
		var list = {};

		for(m in methods){
			var status = methods[m];

			for(key in status){
				if(key > 400){
					var data = status[key].body['application/json'].example;

					list[key] = JSON.parse(data.replace(/\r\n/g, ""));
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
		t += "var $status = JSON.parse(fs.readFileSync('./errors.json'));";
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
	 * Indent the string for code format
	 * @param  {String} string The string of the code
	 * @return {String}        The indented string code
	 */
	indentCode: function(string){
		return beautify(string, {
			indent_char: '\t',
			indent_size: 1
		});
	}
}
