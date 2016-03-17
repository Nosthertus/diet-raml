module.exports = {
	createRoute: function(uri, method){
		var t = '';
		t += 'app.' + method + "('" + uri + "', function($){";
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

			if(code[c] == ';')
				script += code[c] + "\n" + this.setTabs(tabs);

			else if(code[c] == '{'){
				tabs++;
				script += code[c] + "\n" + this.setTabs(tabs);
			}

			else if(code[c] == '}'){
				tabs--;

				if(code[c + 1] == ')'){
					script += "\n" + this.setTabs(tabs) + '}';
				}

				else
					script += "\n" + this.setTabs(tabs) + code[c] + "\n";
			}

			else
				script += code[c];
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
