
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});



// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("postMessage", function(request, response) {
	var ConversationClass = Parse.Object.extend("Conversations");
	var conversation = new ConversationClass();

  if (request.params.from)
		conversation.set("from", request.params.from);
	if (request.params.to) {
		conversation.set("to", request.params.to);
	}
	conversation.set("message", request.params.message);

	conversation.save(null, {
		success: function(conversation) {
			// Execute any logic that should take place after the object is saved.
			response.success( conversation.objectId );
		},
		error: function(conversation, error) {
			// Execute any logic that should take place if the save fails.
			// error is a Parse.Error with an error code and message.
			response.error("Could not create conversation: " + error.message);
		}
	});
});
