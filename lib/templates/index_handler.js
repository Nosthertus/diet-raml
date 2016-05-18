app.header(function($){
	var req = {
		url: $.url,
		method: $.method,
		headers: $.headers,
		query: $.query,
		body: $.body
	};

	var error = hasError(req);

	if(error)
		errorHandler.throwStatus(error, $);

	$.return();
});

function hasError(req){
	var result = null;

	if(!req.query.accessToken){
		result = 401;
	}

	else{
		switch(req.method){
			case "GET":
				if(!hasAccess(req.query)){
					result = 403;
				}
				break;
			case "POST":
				if(!req.body){
					result = 406;
				}
				break;
			case "PUT":
				if(!req.body){
					result = 406;
				}
				break;
			case "DELETE":
				if(!req.body){
					result = 406;
				}
				break;
		}
	}

	return result;
}

function hasAccess(token){
	// Fetch data from DB
	// 
	// Add logic to check access
	
	return true;
}