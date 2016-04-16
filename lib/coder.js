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
		t += 'app.' + method + "('" + uri + "', function($){";
		t += 'var required = {';
		t += 'uriParameters: [],';
		t += 'queryParameters: [],';
		t += 'body: []';
		t += '};';
		t += "//your code here\n";
		t += '});';

		return beautify(t, {
			indent_size: 1,
			indent_char: '\t'
		});
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

		var list = {};

		for(key in status){
			if(key > 400){
				var data = status[key].body['application/json'].example;

				list[key] = JSON.parse(data.replace(/\r\n/g, ""));
			}
		}

		t += '$status = ' + JSON.stringify(list) + ';';

		t += '$.errors = $status[status];';
		t += '$.failure();'

		return beautify(t, {
			indent_size: 1,
			indent_char: '\t'
		});
	},
}
