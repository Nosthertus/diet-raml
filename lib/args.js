var yargs = require('yargs');

module.exports = yargs
	.example('Usage: $0 [options]')
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
			default: 'raml-resources',
			describe: 'directory where to generate resources',
			type: 'string'
		}
	})
	.argv;