// IO Variable, yay!
// Connect to the lobby namespace
var socket = io('http://localhost:3000/lobby');


// Handles initial connection, and client token verification
socket.on('connect', function () {
	socket.emit('lobby connect', localStorage['token']);
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


// Handles redirection orders from server
socket.on('redirect', function(url) {
	moveClient(url);
});


// Handes errors. Noone likes erroes :(
// Receives a single variable:
//		data: A string containing error details
//
// No return, puts data contents in notification area
socket.on('error', function(data) {
	$("#notification").html('<p class="error">' + data.msg + '</p>');
	window.setTimeout(function() {
		$("#notification").html('');
	}, 5000);
});


// Sends the server a manual request for the open games list
$("#refresh").click(function() { 
	socket.emit('get games', socket.id);
	$('#game-info').html('');
});
// Handles data received from the server regarding open games
socket.on('get games', function(games) { // Handling data from the server
	$("#games").html('');
	$.each(games, function(index, value) {
		$("#games").append( $('<li>').text(value._id)
			.attr("class", "game")
			.attr("val", value._id)
			.attr("players", value.players.join(", "))
			.append($("<span>").text(value.numPlayers + '/2')));
	});
});


// Displays the connected users in the lobby
// Receives one variable from the server:
//		users: an array containing usernames
//
// Loops through array and outputs usernames into the connected users section
socket.on('users change', function(users) {
	$("#users").html('');
	$.each(users, function(key, val) {
		$("#users").append($("<li>")
			.text(val)
			.attr("id", "user"));
	});
});


// Function to handle joining a game
$(document).on('dblclick', '#games-list ul li', function() {
	socket.emit('join game', {
		"token": localStorage['token'],
		"matchTitle": $(this).attr('val')
	});
});


// Function to handle hosting a game
$("#host-game").click(function() {
	var gameName = prompt("Please enter a match title");
	if (!gameName)
		return;
	socket.emit('host game', {
		"token": localStorage['token'],
		"matchTitle": gameName
	});
});


// Function to join a game after creating it
// Vairables:
//		data:
//			.newToken: new auth token
//			.url: url to direct browser to
//			.msg: notification to display to user
//
// No reuturn, handles output itself
socket.on('hosted ready', function(data) {
	localStorage['token'] = data.newToken;
	$("#notification").html('<p class="success">' + data.msg + '</p>');
	moveClient(data.url);	
});


// Handles joining games
// Vairables:
//		data:
//			.newToken: new auth token
//			.url: url to direct browser to
//			.msg: notification to display to user
//
// No reuturn, handles output itself
socket.on('join game', function(data) {
	localStorage['token'] = data.newToken;
	$("#notification").html('<p class="success">' + data.msg + '</p>');
	moveClient(data.url);
});


// Handles getting game info
$(document).on('click', '#games-list ul li', function() {
	$('.clicked').removeClass('clicked');
	$(this).addClass('clicked');
	$('#game-info').html('');
	$('#game-info').append($("<p>").text("Players: " + $(this).attr('players')));
});


// Handles sending chat messages
$("#send-message").click(function(event) {
	event.preventDefault();
	var msg = $("#message").val();
	$("#message").val('');
	socket.emit('chat message', {
		"message": msg,
		"token": localStorage['token']
	});
});


// Handles chat messages sent from the server
// Variables:
//		data:
//			.user: the user who sent the message
//			.message: the message from the user
//
// No return, updates chat box accordingly
socket.on('chat message', function(data) {
	$("#messages").append($("<li>").text(data.user + ": " + data.message));
	$("#messages-wrap").scrollTop($("#messages").height());
});


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

$("#notification").click(function() {
	$(this).html('');
});

// Logout function - fires when logout is pressed
$("#logout").click(function() {
	localStorage['token'] = '';
	localStorage['username'] = '';
	window.location.replace('/');
});
