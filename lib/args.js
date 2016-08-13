var yargs = require('yargs');

module.exports = yargs
	.example('Usage: $0 -t api.raml -d routes/raml-resources')
	.options({
		't': {
			alias: 'target',
			demand: true,
			describe: 'root raml file directory',
			type: 'string'
		},
		'd': {
			alias: 'directory',
			demand: false,
			default: './',
			describe: 'directory where to generate resources',
			type: 'string'
		},
		'h': {
			alias: 'add-schemas',
			demand: false,
			describe: "Whether add schemas found in RAML file",
			type: "boolean"
		},
		'n': {
			alias: 'no-index',
			demand: false,
			describe: "Wheter omit index file generation",
			type: "boolean"
		},
		'e': {
			alias: 'no-errors',
			demand: false,
			describe: "wheter omit error and handler file generation",
			type: "boolean"
		},
		'z': {
			alias: "zip",
			demand: false,
			describe: "wheter compress the files into a zip file",
			type: "boolean"
		}
	})
	.argv;