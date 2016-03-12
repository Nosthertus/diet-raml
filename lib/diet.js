var utils = require('utils')._;

module.exports  = {
	/**
	 * Transforms parameters with format {param} to :param
	 * @param  {String} uri The URI target to parse parameters
	 * @return {String}     The URI with parsed parameters
	 */
	parseUriParams: function(uri){
		var str = utils.replace(uri, '{', ':');

		return utils.replace(str, '}', '');
	}
}