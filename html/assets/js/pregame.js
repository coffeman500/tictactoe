// IO Variable, yay!
// Connect to the pregame namespace
var socket = io('http://localhost:3000/pregame');


// Handles initial connection
socket.on('connect', function() {
	socket.emit('pregame connect', localStorage['token']);
});


// Handles validation errors from the server due to shitty tokens (fuckin' tokens)
// Receives the following:
//		data
//			.msg: error message
//			.url: url to redirect to
//
// No returns, just redirects the client
socket.on('validation error', function(data) {
	$("#notification").html('<p class="error">' + data.msg + '</p>');
	localStorage['token'] = '';
	localStorage['username'] = '';
	moveClient(data.url);
});


// Handles errors sent by the server
socket.on('error', function(data) {
	$("#notification").html('<p class="error">' + data.msg + '</p>');
});


// Handles join errors
// Variables:
//		data:
//			.msg: the message to display to the user
//			.url: the url to redirect the user to  
//			.token: the new token for the user
//
// No return, handles client directly
socket.on('join error', function(data) {
	console.log('got join error');
	localStorage['token'] = data.token;
	$("#notification").html('<p class="error">' + data.msg + '</p>');
	moveClient(data.url);
});







// Handles redirections
function moveClient(url) {
	setTimeout(function() {
		window.location.replace(url);
	}, 2000)
}