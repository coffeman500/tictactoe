// IO Variable, yay!
var socket = io();

socket.on("render", function(board) {
	render(board[0], board[1]);
});
socket.on("star", function(loc) {
	drawBlock(loc[0], loc[1], "yellow");
});

socket.on("player", function(num) {
	console.log("Player: " + num);
})

function startGame() {
	socket.emit("start");
}

// Handle directional inuput 
$(window).keydown(function(e) {
	e.preventDefault();
	if (e.keyCode == 40) {
		socket.emit("change direction", "down");
	} else if (e.keyCode == 37) {
		socket.emit("change direction", "left");
	} else if (e.keyCode == 38) {
		socket.emit("change direction", "up");
	} else if (e.keyCode == 39) {
		socket.emit("change direction", "right");
	}
})

// Initiate canvas things
var canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d"),
	cW = 399,
	cH = 399;

ctx.canvas.width = cW;
ctx.canvas.height = cH;



function render(board, starLoc) {
	console.log("got render");
	ctx.clearRect(0, 0, cW, cH);
	drawBlock(starLoc[0], starLoc[1], "yellow");
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board.length; j++) {
			if (board[i][j] != null) {
				drawBlock(i, j, board[i][j]);
			}
		}
	}

}

function drawBlock(x, y, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x*20, y*20, 19, 19);
}