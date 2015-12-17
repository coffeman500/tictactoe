// IO Variable, yay!
var socket = io();


// Handles the user if they already have a token
// No input, just moves the browser
//
// No return, server handles request
if (localStorage['token']) {
	$("#notification").html('<p class="success">Welcome back! Sending you to the lobby...</p>');
	moveClient('/lobby');
}



// Handes errors. Noone likes erroes :(
// Receives a single variable:
//		data: A string containing error details
//
// No return, puts data contents in notification area
socket.on('error', function(data) {
	$("#notification").html('<p class="error">' + data + '</p>');
});



// Handles successful login attempt
// Receives a JSON Object:
//		data: 
//			data.token: The user's auth token
//			data.url: URL to redirect user to
//
//	No return, handles client
socket.on('login', function(data) {
	localStorage['token'] = data.token;
	localStorage['username'] = data.username
	$("#notification").html('<p class="success">Success! Hold on to your panties, we\'re goin\' to the lobby!</p>');	
	moveClient(data.url);
});



// Sends a login request to server
// Takes two variables:
//		user: username for login
//		pass: password for login
//
// Passes user, pass, and the session's socketID to the server
// No return, errors are passed to the error handler
function attemptLogin(user, pass) {
	socket.emit('login', {
		"username": user,
		"password": pass,
		"socket": socket.id
	});
}



// Page handling:


// Simple redirect function
function moveClient(url) {
	window.setTimeout(function() {
		window.location.replace(url);
	}, 1000);
}


// Handles form submission
$("#login-form").submit(function(event) {
	event.preventDefault();
	var username = $("#username").val();
	var password = $("#password").val();
	attemptLogin(username, password);
	$("#password").val('');
});



