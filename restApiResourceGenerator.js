var aws = require('aws-sdk');
var async = require('async');


exports = module.exports = new generator();

function generator(){

	var self = this;

	var awsOptions = {region: config.region};
	if (config.awsProfile) awsOptions.profile = config.awsProfile;
	var apigateway = new aws.APIGateway(awsOptions);


	var _region = "us-west-2";
	var params = {};
	var restApiId = "";
	var	apiKeyRequired: false;
	var	authorizationType: "NONE"



	self.apiResourceId = "";


	self.createResource = function(params) {
		var callback_ = arguments[arguments.length - 1];
		var callback = (typeof(callback_) == 'function' ? callback_ : function(){});

		params.restApiId = restApiId;

		apigateway.createResource(params, function(err, data) {
			if (err) { console.log(err, err.stack); callback(err); }
			else {  // successful response
				self.apiResourceId = data.id;
				callback(err, data);
			}
		});
	};


	var configMethodParams = function(method, params, useAuth) {
		params.restApiId = restApiId;
		params.resourceId = apiResourceId;
		params.httpMethod = method;

		if (useAuth) {
			params.authorizationType = authorizationType;
			params.apiKeyRequired = apiKeyRequired;
		}

		return params;		
	};
	var buildIntegrationUri = function(lambdaId) {
		res = 'arn:aws:apigateway:' 
            + _region
            + ':lambda:path/2015-03-31/functions/arn:aws:lambda:'
            + _region
            + ':'
            + _awsAccountNumber
            + ':function:'
            + lambdaId
            + '/invocations'
	};


	self.createGetMethod = function(methodParams, integrationParams) {
		var callback_ = arguments[arguments.length - 1];
		var callback = (typeof(callback_) == 'function' ? callback_ : function(){});

		apigateway.putMethod(configMethodParams("GET", methodParams, true), function(err, data) {
			callback(err, data);
			if (err) { callback(err); }
			else {
				apigateway.putIntegration(configMethodParams("GET", integrationParams), function(err, data) {
					callback(err, data);
				});
			}
		});
	};
	self.createPostMethod = function(params) {
		var callback_ = arguments[arguments.length - 1];
		var callback = (typeof(callback_) == 'function' ? callback_ : function(){});

		apigateway.putMethod(configMethodParams("POST", params), function(err, data) {
			callback(err, data);
		});
	};

	self.init = function(region, apiId, resourceParams) {
		restApiId = apiId;
		params = resourceParams;
		_region = region;

		apiKeyRequired: params.apiKeyRequired;
		authorizationType: params.authorizationType;


		async.series([
			function(callback){
				// setup the resource ...
				self.createResource(params.resourceParams, function(err, data){
					callback(err, data);
				});
			},
			function(callback){
				// setup the get method ...
				self.createGetMethod(params.getMethod, params.getIntegration, function(err, data){
					callback(err, data);
				});
			}
		],
		// optional callback
		function(err, results){
			// results is now equal to ['one', 'two']
		});

	};

}


