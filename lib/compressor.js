var archiver = require("archiver");
var fs       = require("fs");

module.exports.zip = function(opts, cb){
	var archive = archiver("zip");

	var output = fs.createWriteStream(opts.name+".zip");

	output.on("close", function(){
		if(cb){
			cb(null);
		}
	});

	archive.pipe(output);

	archive.bulk([{
		expand: true,
		cwd: opts.dir,
		src: ["**"]
	}]);

	archive.finalize();
}