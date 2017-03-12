console.log('Loading function');

var doc = require('dynamodb-doc');
var dynamo = new doc.DynamoDB();

exports.handler = function(event, context) {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    // Prepare the item
    var operation = event.operation;
    event.TableName = "myTable";
    delete event.operation;

    switch (operation) {
        case 'create':
            if (validateContent(event.Item)) dynamo.putItem(event, context.done);
            break;
        case 'read':
            dynamo.getItem(event, context.done);
            break;
        case 'update':
            if (validateContent(event.Item)) dynamo.updateItem(event, context.done);
            break;
        case 'delete':
            dynamo.deleteItem(event, context.done);
            break;
        case 'list':
            dynamo.scan(event, context.done);
            break;
        case 'echo':
            context.succeed(event);
            break;
        case 'ping':
            context.succeed('pong');
            break;
        default:
            context.fail(new Error('Unrecognized operation "' + operation + '"'));
    }
};

function validateContent(item){
    return true;
};