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
			case "get":
				if(!hasAccess(req.query)){
					result = 403;
					break;
				}
			case "post":
				if(!req.body){
					result = 406;
					break;
				}
			case "put":
				if(!req.body){
					result = 406;
					break;
				}
			case "delete":
				if(!req.body){
					result = 406;
					break;
				}
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