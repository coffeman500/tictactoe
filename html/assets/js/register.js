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
// Takes a single variable:
//		data: A string containing error details
//
// No return, puts data contents in notification area
socket.on('error', function(data) {
		$("#notification").html('<p class="error">' + data + '</p>');
});


// Handles the successful account creation response
socket.on('create account', function(data) {
	if (data.status) {
		$("#notification").html('<p class="success">Account successfully created, redirecting back to login page..</p>');
		window.setTimeout(function() {
			window.location.replace('/');
		}, 2000);	
	}
});



// Function to send a create user request
function createAccount(user, pass) {
	socket.emit('create account', {
		"username": user,
		"password": pass,
		"socket": socket.id
	});
}



// Form submission
$("#reg-form").submit(function(event) {
	event.preventDefault();
	var username = $("#username").val();
	var password = $("#password").val();
	var passVerify = $("#passwordVerify").val();
	
	if (password != passVerify) {
		$("#notification").html('<p class="error">It appears your passwords don\'t match, let\'s try that again..</p>');
		$("#password").val('');
		$("#passwordVerify").val('');
	}
	else {
		createAccount(username, password);
	}
});
