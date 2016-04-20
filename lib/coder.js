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

	parseErrors: function(status){
		var list = {};

		for(key in status){
			if(key > 400){
				var data = status[key].body['application/json'].example;

				list[key] = JSON.parse(data.replace(/\r\n/g, ""));
			}
		}

		return list;
	},

	indentCode: function(string){
		return beautify(string, {
			indent_char: '\t',
			indent_size: 1
		});
	}
}
