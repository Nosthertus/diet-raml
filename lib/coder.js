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
		t += '});',

		t = this.prettify(t);

		return t;
	},
	prettify: function(code){
		var tabs = 0;
		var script = '';

		for(c in code){
			c = parseInt(c);

			if(code[c] == ';'){
				if(code[c - 1] == '}')
					script += "\n" + this.setTabs(tabs) + '};' + '\n\n' + this.setTabs(tabs);
			
				else
					script += code[c] + "\n";

			}

			else if(code[c] == ',' && tabs > 1)
				script += code[c] + '\n' + this.setTabs(tabs);

			else if(code[c] == '{'){
				tabs++;
				script += code[c] + "\n" + this.setTabs(tabs);
			}

			else if(code[c] == '}'){
				tabs--;

				if(code[c + 1] == ')'){
					script += "\n" + this.setTabs(tabs) + '}';
				}

				else if(code[c + 1] != ';')
					script += "\n" + this.setTabs(tabs) + code[c] + "\n";
			}

			else{
				script += code[c];
			}
		}

		return script;
	},
	setTabs: function(times){
		var t = "";

		if(times > 0){
			for (var i = 1; i <= times; i++) {
				t += "\t";
			}
		}

		return t;
	}

}
