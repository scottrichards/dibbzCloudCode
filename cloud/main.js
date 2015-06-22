
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

var Image = require("parse-image");


Parse.Cloud.beforeSave("Items", function(request, response) {
  var item = request.object;
  if (!item.get("Image")) {
    response.error("Items must have an image.");
    return;
  }

  if (!item.dirty("Image")) {
    // The profile photo isn't being modified.
    response.success();
    return;
  }

  Parse.Cloud.httpRequest({
    url: item.get("Image").url()

  }).then(function(response) {
    var image = new Image();
    return image.setData(response.buffer);

  }).then(function(image) {
    // Resize the image to 64x64.
    console.log("creating thumbnail at 64x64");
    return image.scale({
      width: 64,
      height: 64
    });

  }).then(function(image) {
    // Make sure it's a JPEG to save disk space and bandwidth.
    console.log("created thumbnail dimensions: " + image.width() + "x" + image.height());
    return image.setFormat("JPEG");

  }).then(function(image) {
    // Get the image data in a Buffer.
    return image.data();

  }).then(function(buffer) {
    // Save the image into a new file.
    var base64 = buffer.toString("base64");
    var cropped = new Parse.File("thumbnail.jpg", { base64: base64 });
    return cropped.save();

  }).then(function(cropped) {
    // Attach the image file to the original object.
    console.log("setting Thumbnail");
    item.set("Thumbnail", cropped);

  }).then(function(result) {
    response.success();
  }, function(error) {
    response.error(error);
  });
});

Parse.Cloud.beforeSave(Parse.User, function(request, response) {
  var item = request.object;
  if (!item.get("userImage")) {
		response.success();		// if no Image is specified
    return;
  }

  if (!item.dirty("userImage")) {
    // The profile photo isn't being modified.
    response.success();
    return;
  }

  Parse.Cloud.httpRequest({
    url: item.get("userImage").url()

  }).then(function(response) {
    var image = new Image();
    return image.setData(response.buffer);

  }).then(function(image) {
    // Resize the image to 64x64.
    console.log("creating thumbnail at 64x64");
    return image.scale({
      width: 64,
      height: 64
    });

  }).then(function(image) {
    // Make sure it's a JPEG to save disk space and bandwidth.
    console.log("created thumbnail dimensions: " + image.width() + "x" + image.height());
    return image.setFormat("JPEG");

  }).then(function(image) {
    // Get the image data in a Buffer.
    return image.data();

  }).then(function(buffer) {
    // Save the image into a new file.
    var base64 = buffer.toString("base64");
    var cropped = new Parse.File("thumbnail.jpg", { base64: base64 });
    return cropped.save();

  }).then(function(cropped) {
    // Attach the image file to the original object.
    console.log("setting Thumbnail");
    item.set("Thumbnail", cropped);

  }).then(function(result) {
    response.success();
  }, function(error) {
    response.error(error);
  });
});

// Parse.Cloud.afterSave("Items", function(request, response) {
// 
// 
// 	Parse.Cloud.httpRequest({
// 		url: request.object.get("Image").url(),
// 		success: function(response) {
// 			// The file contents are in response.buffer.
// 			var image = new Image();
// 			return image.setData(response.buffer, {
// 				success: function() {
// 					console.log("Image is " + image.width() + "x" + image.height() + ".");
// 					image.scale({
// 						width: 64,
// 						height: 64,
// 						success: function(image) {
// 							console.log("Thumbnail image is: " + image.width() + "x" + image.height());
// 							request.object.set("ImageThumbnail",image);
// 							request.object.save(null, {
// 								success: function(dibbzItem) {
// 									// Execute any logic that should take place after the object is saved.
// 									console.log('Added thumbnail: ' + dibbzItem.id);
// 								},
// 								error: function(dibbzItem, error) {
// 									// Execute any logic that should take place if the save fails.
// 									// error is a Parse.Error with an error code and message.
// 									alert('Failed to update object, with error code: ' + error.message);
// 								}
// 							});
// //							response.success();
// 						},
// 						error: function(error) {
// 							console.log("could not create an image thumbnail");
// //							response.error("could not create an image thumbnail");
// 						}
// 					});
// 				},
// 				error: function(error) {
// 					console.log("The image data was invalid."); 
// 					response.error("The image data was invalid");
// 				}
// 			})
// 		},
// 		error: function(error) {
// 			console.log("The networking request failed");
// 			response.error("The networking request failed");
// 			// The networking request failed.
// 		}
// 	});
// });

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
		query.get(request.params.to, {
			success: function(parseUser) {
					console.log("found user id: " + parseUser.userId);
					conversation.set("to",parseUser);
					conversation.save(null, {
						success: function(conversation) {
							// Execute any logic that should take place after the object is saved.
							var conversationId = conversation.id;
							console.log("Created Conversion id#: " + conversationId);
							response.success( conversationId );
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
