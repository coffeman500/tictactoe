// IO Variable, yay!
// Connect to the lobby namespace
var socket = io('http://localhost:3000/lobby');


// Handles initial connection, and client token verification
socket.on('connect', function () {
	socket.emit('lobby connect', {
		"token": localStorage['token'],
		"username": localStorage['username'],
		"socket": socket.id
	});
	socket.emit('get games', socket.id); // Load the game list on load
});


// Handles validation errors from the server due to shitty tokens
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


// Handes errors. Noone likes erroes :(
// Receives a single variable:
//		data: A string containing error details
//
// No return, puts data contents in notification area
socket.on('error', function(data) {
	$("#notification").html('<p class="error">' + data + '</p>');
});


// Sends the server a manual request for the open games list
$("#refresh").click(function() { 
	socket.emit('get games', socket.id);
});

// Handles data received from the server regarding open games
socket.on('get games', function(games) { // Handling data from the server
	$("#games").html('');
	$.each(games, function(index, value) {
		$("#games").append( $('<li>').text(value._id)
			.attr("class", "game")
			.attr("val", value._id)
			.append($("<span>").text(value.numPlayers + '/2')));
	});
});


// Function to handle joining a game
$(document).on('dblclick', '#games-list ul li', function() {
	// TODO: Handle game join function
});

// TODO: Setup listener for receiving list of users in lobby

// Simple function to redirect the user
// Takes one variable:
//		url: url to redirect to
//
// No return, just redirects the client
function moveClient(url) {
	window.setTimeout(function() {
		window.location.replace(url);
	}, 2000);
}


// Page handling functions:
$(document).ready(function() {
	$("#account-username").html(localStorage['username']);
});

// Logout function - fires when logout is pressed
$("#logout").click(function() {
	localStorage['token'] = '';
	localStorage['username'] = '';
	window.location.replace('/');
});
