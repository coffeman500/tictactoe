// Gettin dat connection
var socket = io('http://localhost:3000/game');

// 

// Handles initial connection
socket.on('connect', function() {
	socket.emit('game connect', localStorage['token']);
});


// Sets up the game board with current moves
socket.on('init', function(data) {
	$.each(data.board, function(key, val) {
		if (val == 1)
			drawMove(0, key);
		else if (val == 2)
			drawMove(1, key);
	});
	$("#p1label").html(data.p1);
	$("#p2label").html(data.p2);
	$("#p" + (data.pTurn + 1) + "label").addClass("pActive");
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


// Handles player leaving
socket.on('player left', function(data) {
	if (data.user != localStorage['username']) {
		$("#notification").html('<p class="error">' + data.msg + '</p>');
	}
	window.setTimeout(function() {
		socket.emit('leave game', localStorage['token']);
	}, 5000);
});


// Handles a move made from the server
// Variables:
//		data:
//			.pTurn: the player who made the move
//			.sector: the sector the move was made in
//
// No return, handles updates itself
socket.on('move made', function(data) {
	drawMove(data.pTurn, data.sector);
	$(".pActive").removeClass("pActive");
	var pPrev = !data.pTurn;
	$("#p" + (pPrev + 1) + "label").addClass("pActive");
});


// Handles game over from the server
// Variables:
//		data:
//			.victor
//
// No return
socket.on('game over', function(data) {
	if (data.victor == 0) {
		$("#notification").html('<p class="error">Looks like we have a stalemate. You both suck.</p>');
	}
	else {
		$("#notification").html('<p class="success">Game Over, ' + $("#p" + data.victor + "label").html() + ' has won.</p>');
	}
})


// Handles leaving the game
$("#leave-button").click(function() {
	socket.emit('leave game', localStorage['token']);
});


// Handles the order to leave the game from the server
// Variables:
//		data:
//			.newToken: new auth token for the user
//			.msg: message to display to user
//			.url: url to redirect to
//
// Handles client directly
socket.on('leave game', function(data) {
	localStorage['token'] = data.newToken;
	$("#notification").html('<p class="success">' + data.msg + '</p>');
	moveClient(data.url);
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


// Initialize the board
$(document).ready(function() {
	init();
});


// Function to handle clicks on the canvas
$("#game").click(function(event) {
    event = event || window.event;

    var x = event.pageX - canvas.offsetLeft,
        y = event.pageY - canvas.offsetTop;

    var sector = getSector(x, y);

    socket.emit('make move', {
    	"token": localStorage['token'],
    	"sector": sector
    });
});


// Handles getting draw start coordinates for a section
function getCenter(section) {

	var coords = {
		"x": ((section % 3) * 200) + 102,
		"y": (Math.floor(section / 3) * 200 ) + 102
	}
	return coords;
}

function getSector(x, y) {
	var sector = 0;
	sector += Math.ceil(x / 200);
	sector += Math.floor(y / 200) * 3;
	return (sector - 1);
}


// From here down, we shall draw.
var canvas = document.getElementById('game');
var ctx = canvas.getContext("2d");
ctx.lineWidth = 7;

// Function to initialize the board
function init() {
	ctx.fillRect(0, 200, 600, 5);
	ctx.fillRect(0, 400, 600, 5);
	ctx.fillRect(200, 0, 5, 600);
	ctx.fillRect(400, 0, 5, 600);
}

function drawMove(type, section) {
	var start = getCenter(section);
	if (type == 0) {
		ctx.beginPath();
		ctx.arc(start.x, start.y, 80, 0, 2 * Math.PI);
		ctx.stroke();
	}
	else if (type == 1) {
		ctx.beginPath();
		ctx.moveTo(start.x - 80, start.y - 80);
		ctx.lineTo(start.x + 80, start.y + 80);
		ctx.moveTo(start.x - 80, start.y + 80);
		ctx.lineTo(start.x + 80, start.y - 80);
		ctx.stroke();
	}
	else {
		// Type not found
	}
}