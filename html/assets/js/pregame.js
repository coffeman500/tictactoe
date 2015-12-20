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
	window.setTimeout(function() {
		$("#notification").html('');
	}, 5000);
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



// Displays the connected users in the room
// Receives one variable from the server:
//		users: an array containing usernames
//
// Loops through array and outputs usernames into the connected users section
socket.on('users change', function(users) {
	$("#users").html('');
	$.each(users, function(key, val) {
		$("#users").append($("<li>")
			.text(val)
			.attr("id", val)
			.append($("<span>")
				.addClass('ready-icon')
				.css('display', 'none')));
	});
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


// Handles retrieval of ready player list
socket.on('ready change', function(players) {
	$.each($(".ready-icon"), function(key, val) {
		if (players.indexOf($(val).parent().attr('id')) != -1) {
			$(val).css('display', 'block');
		}
		else {
			$(val).css('display', 'none');
		}
	});
});

// Handles the ready button
$("#ready-button").click(function() {
	if ($(this).attr('ready') == 'false') {
		$(this).attr('ready', 'true');
		$(this).removeClass('not-ready').addClass('ready');
		socket.emit('ready player', localStorage['token']);
	}
	else {
		$(this).attr('ready', 'false');
		$(this).removeClass('ready').addClass('not-ready');
		socket.emit('unready player', localStorage['token']);
	}
});


$("#notification").click(function() {
	$(this).html('');
});

// Handles redirections
function moveClient(url) {
	setTimeout(function() {
		window.location.replace(url);
	}, 2000)
}
