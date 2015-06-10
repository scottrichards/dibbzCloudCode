
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

	console.log("postMessage to: " + request.params.to);

	var currentUser = Parse.User.current();
	if (currentUser) {
			console.log("user is logged in");
			conversation.set("from", currentUser);
	} else {
			console.log("no user is logged in");
	}
	if (request.params.to) {
		var query = new Parse.Query(Parse.User);
		query.equalTo("objectId", request.params.to);  // find all the women
		query.find({
			success: function(queryResult) {
					console.log("found user id: " + request.params.to);
					console.log("queryResult: " + queryResult);
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
			}
		});

	}
	conversation.set("message", request.params.message);

	
});
