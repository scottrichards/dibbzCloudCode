
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

// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("addItemThumbnails", function(request, response) {
	var Items = Parse.Object.extend("Items");
	var query = new Parse.Query(Items);
 	query.find().then(function(results) {
			console.log("Successfully retrieved " + results.length + " items.");
			// Do something with the returned Parse.Object values
			for (var i = 0; i < 8; i++) {
				var object = results[i];
				if (object.get('Thumbnail')) {
					console.log(object.get('Name') + ' Thumbnail EXISTS ');
				} else {
					console.log(object.get('Name') + ' NO Thumbnail ');
					console.log("url: " + object.get("Image").url());
					Parse.Cloud.httpRequest({
							url: object.get("Image").url(),
						}).then(function(response) {
						  console.log("Loaded Image");
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
							object.set("Thumbnail", cropped);
							console.log("Set Thumbnail for " + object.get('Name'));
							object.save();
						}).then(function(result) {
//							console.log("Saved :" + savedObject.get('Name')); 
							response.success();							
						}, function(error) {
							response.error(error);
						});
				}
			}
		}, function(error) {
			console.log("Error: " + error.code + " " + error.message);
		});
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


// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("addItemThumbnail", function(request, response) {
	var Items = Parse.Object.extend("Items");
	var query = new Parse.Query(Items);
	query.equalTo("objectId",request.params.objectId);
	query.find().then(function(results) {
		console.log("Successfully retrieved " + results.length + " items.");
		// Do something with the returned Parse.Object values
		
		var object = results[0];
		if (object.get('Thumbnail')) {
			console.log(object.get('Name') + ' Thumbnail EXISTS ');
		} else {
			console.log(object.get('Name') + ' NO Thumbnail ');
			console.log("url: " + object.get("Image").url());
			Parse.Cloud.httpRequest({
					url: object.get("Image").url(),
				}).then(function(response) {
					console.log("Loaded Image");
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
					object.set("Thumbnail", cropped);
					console.log("Set Thumbnail for " + object.get('Name'));
					object.save();
				}).then(function(result) {
//							console.log("Saved :" + savedObject.get('Name')); 
					response.success();							
				}, function(error) {
					response.error(error);
				});
		}
	}, function(error) {
		console.log("Error: " + error.code + " " + error.message);
	});
});
