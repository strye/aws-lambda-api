# AWS-Lambda-API
This is a template for generating a restfull API that uses apiGateway, lambdas and dynamoDb from AWS. It uses gulp as a deployment tool, and allows for a quick and simple setup.

The template can be modified in many differnt ways to fit your workflow or code structure. For example instead of being focused on a single object with forlders for dynamo, lambdas, etc., you could manage multiple microservices by giving each it's own top level folder and extending the gulpfile and config files to support multiple builds.

## TODO
- The API Gateway is not automated at this time.
- Allow option to upload lambda package into S3 bucket
- write tests

## Setup
Duplicate the file "configSample.json" and rename "config.json". remove all comments and update the settings to meet your project needs. You will also need to set the ARN to your lambda role. "config.json" is listed in gitignore, so that your local settings will not be uploaded into source control. You may of course change this for your own purposes, when loading into a private repository.


## Implementation notes
The following are some notes about the implementaitons and code snipits for manual setup.

## gulp-awslambda
[gulp-awslambda] has some issues, but works for our purposes at this time. 

You will see that the parameter "Runtime", is commented out in the config file. The default is "nodejs" which works for this template. There is a bug in the gulp-awslambda code that does not prperly remove the property when performing a confinguration update. This parameter is only allowed as a part of a createFunction() call, and throws an error during an updateFunctionConfiguration() call.

### Lambda Role Permissions
Here is a sample policy of permission sneed by the lambda function. The code expects that the role used has these permissions

```javascript
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Stmt1428341300017",
      "Action": [
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem"
      ],
      "Effect": "Allow",
      "Resource": "*"
    },
    {
      "Sid": "",
      "Resource": "*",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Effect": "Allow"
    }
  ]
}
```


### Test object for create (post method)
```javascript
{
    "operation": "create",
    "TableName": "myTable",
    "Item": {
        "Parent": "1",
        "Id": "1",
        "Key1": "value1"
    }
}
```

### sample map for get method
```javascript
#set($inputRoot = $input.path('$'))
{
    "operation": "read",
    "TableName": "myTable",
    "Key": {
        "Parent": "$inputRoot.parent",
        "Id": "$inputRoot.id"
    }
}
```

