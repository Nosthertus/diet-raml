var beautify = require('js-beautify').js_beautify;

module.exports = {
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
	}
}
