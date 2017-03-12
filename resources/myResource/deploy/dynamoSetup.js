var aws = require('aws-sdk');
//var async = require('async');

var params = require("../dynamo/myTable");
var appConfig = require("../../../config.json");

exports = module.exports = new dynamoDeploy();

function dynamoDeploy(){
	var callback_ = arguments[arguments.length - 1];
	var callback = (typeof(callback_) == 'function' ? callback_ : function(){});

	var awsOptions = {region: appConfig.region};
	if (config.awsProfile) awsOptions.profile = appConfig.awsProfile;
	if (config.dynamoDb.localEndpoint) awsOptions.endpoint = new aws.Endpoint(config.dynamoDb.localEndpoint);

	var dynamodb = new aws.DynamoDB(awsOptions);

	if (checkTable()) {
		// error
	} else {
		dynamodb.createTable(params, function(err, data) {
			if (err) {console.log(err, err.stack); callback(err);} // an error occurred
			else     {
				// Log Dynamo Information
				callback(null, data);
			}           // successful response
		});
	}
}


// Check to see if table exists
function checkTable() {
	return false;
}
