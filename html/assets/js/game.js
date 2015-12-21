// Gettin dat connection
var socket = io('http://localhost:3000/game');


// Handles initial connection
socket.on('connect', function() {
	socket.emit('game connect', localStorage['token']);
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






// Function to handle clicks on the canvas
$("#game").click(function(event) {
    event = event || window.event;

    var x = event.pageX - canvas.offsetLeft,
        y = event.pageY - canvas.offsetTop;

    alert(x + ' ' + y);
});

// Function to return sector from coordinates

// From here down, we shall draw.
var canvas = document.getElementById('game');
var ctx = canvas.getContext("2d");

// Function to initialize the board
function init() {
	ctx.fillRect(10, 200, 580, 5);
	ctx.fillRect(10, 400, 580, 5);
	ctx.fillRect(200, 10, 5, 580);
	ctx.fillRect(400, 10, 5, 580);
}