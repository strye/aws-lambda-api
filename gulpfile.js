var gulp = require('gulp');
var aws = require('aws-sdk');
var zip = require("gulp-zip");
var del = require('del');
var shell = require('gulp-shell');

// [gulp-awslambda] has some issues, but works for our purposes at this time.
var lambdaUtil = require('gulp-awslambda');


var config = require("./config.json");




/*** Setup Dynamo Tables		********/
gulp.task('dynamo:setup', function() {
	var params = require("./dynamo/myTable");

	var awsOptions = {region: config.region};
	if (config.awsProfile) awsOptions.profile = config.awsProfile;
	if (config.dynamoDb.localEndpoint) awsOptions.endpoint = new aws.Endpoint(config.dynamoDb.localEndpoint);

	var dynamodb = new aws.DynamoDB(awsOptions);


	dynamodb.createTable(params, function(err, data) {
		if (err) console.log(err, err.stack); // an error occurred
		else     console.log(data);           // successful response
	});
});





/*** Setup Lambda  				********/
gulp.task('lambda:clean', function() {
	del.sync([ 'dist/*' ]);
	del.sync([ 'tmp/*' ]);
});
gulp.task('lambda:build', ['lambda:clean'], function() {
	// Copy code to tmp folder
	// Then install npm into tmp
	return gulp.src('lambdas/*')
		.pipe(gulp.dest('tmp'))
		.pipe(shell([ 'cd tmp && npm install' ]));
}); 
gulp.task('lambda:deploy', ['lambda:build'], function() {
	var awsOptions = {region: config.region};
	if (config.awsProfile) awsOptions.profile = config.awsProfile;


	// Zip the code & deploy to aws
	return gulp.src([ 'tmp/*' ], {base: "tmp/"})
		.pipe(zip('lambda-api.zip'))
		.pipe(lambdaUtil(config.lambda.params, awsOptions))
		.pipe(gulp.dest('dist'));
});




var restApiId = "";
/*** Setup Gateway API  		********/
gulp.task('apig:create', function() {
	var awsOptions = {region: config.region};
	if (config.awsProfile) awsOptions.profile = config.awsProfile;

	var apigateway = new aws.APIGateway(awsOptions);

	apigateway.createRestApi(config.apiGateway.restParams, function(err, data) {
		if (err) console.log(err, err.stack); // an error occurred
		else {  // successful response
			restApiId = data.id;
			console.log(data);
		}           
	});
})
gulp.task('apig:resource', function() {
	var awsOptions = {region: config.region};
	if (config.awsProfile) awsOptions.profile = config.awsProfile;

	var apigateway = new aws.APIGateway(awsOptions);

	var params = config.apiGateway.resourceParams;
	params.restApiId = restApiId;
	apigateway.createResource(params, function(err, data) {
		if (err) console.log(err, err.stack); // an error occurred
		else {  // successful response
			apiResourceId = data.id;
			console.log(data);
		}           
	});
}

gulp.task('apig:resource:get', function() {
	var awsOptions = {region: config.region};
	if (config.awsProfile) awsOptions.profile = config.awsProfile;

	var apigateway = new aws.APIGateway(awsOptions);

	var params = {
		authorizationType: 'NONE', /* required */
		httpMethod: 'GET', /* required */
		resourceId: '', /* required */
		restApiId: '', /* required */
		apiKeyRequired: false,
		requestParameters: {
			someKey: false,
			anotherKey: false
		}
	};

	var params = config.apiGateway.resourceGetParams;
	params.restApiId = restApiId;
	params.resourceId = apiResourceId;

	apigateway.putMethod(params, function(err, data) {
		if (err) console.log(err, err.stack); // an error occurred
		else     console.log(data);           // successful response
	});
}


// For deployment
//   Create Dynamo
//     Setup Dynamo Table
//     
//   Create Create Lambda
//     Build Package
//     Deploy Package
//     OUTPUT: Lambda URI needed for ApiG
//   Create API Gateway
//     Setup API
//       Create Stages
//       Setup Resource
//         Setup Methods
//           GET
//           POST
//           PUT
//           DELETE


