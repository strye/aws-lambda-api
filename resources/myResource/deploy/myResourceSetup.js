var aws = require('aws-sdk');
var async = require('async');

var appConfig = require("../../../config.json");
var config = require("./config.json");


exports = module.exports = new resourceDeploy();

function resourceDeploy(){
	var self = this;

	var awsOptions = {region: appConfig.region};
	if (config.awsProfile) awsOptions.profile = config.awsProfile;
	var apigateway = new aws.APIGateway(awsOptions);


	var _restApiId = "";




	self.apiResourceId = "";


	self.createResource = function(params) {
		var callback_ = arguments[arguments.length - 1];
		var callback = (typeof(callback_) == 'function' ? callback_ : function(){});

		params.restApiId = _restApiId;

		apigateway.createResource(params, function(err, data) {
			if (err) { console.log(err, err.stack); callback(err); }
			else {  // successful response
				self.apiResourceId = data.id;
				callback(err, data);
			}
		});
	};


	var configMethodParams = function(method, params) {
		params.restApiId = _restApiId;
		params.resourceId = self.apiResourceId;
		params.httpMethod = method;

		return params;		
	};
	var buildIntegrationUri = function(lambdaId) {
		res = 'arn:aws:apigateway:' 
            + appConfig.region
            + ':lambda:path/2015-03-31/functions/arn:aws:lambda:'
            + appConfig.region
            + ':'
            + appConfig.awsAccountNumber
            + ':function:'
            + lambdaId
            + '/invocations'
	};


	self.createGetMethod = function(methodParams, integrationParams) {
		var callback_ = arguments[arguments.length - 1];
		var callback = (typeof(callback_) == 'function' ? callback_ : function(){});

		apigateway.putMethod(configMethodParams("GET", methodParams), function(err, data) {
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

	self.init = function(apiId) {
		_restApiId = apiId;

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


