// Some packages we're going to need
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Routing
app.use(express.static(__dirname + '/html/assets'));

// Home page, server login page
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/html/index.html');

});

var renderLoop;
var pNum = 0;
var starLoc = []; 
var board = [[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			 [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]];

var p1 = {
	socket: null,
	color: "black",
	snake: [[3, 6], [3, 5], [3, 4]],
	direction: "down",
	grow: false,
	dead: false
};

var p2 = {
	socket: null,
	color: "green",
	snake: [[6, 6], [6, 5], [6, 4]],
	direction: "down",
	grow: false,
	dead: false
};

var p3 = {
	socket: null,
	color: "gray",
	snake: [[9, 6], [9, 5], [9, 4]],
	direction: "down",
	grow: false,
	dead: false
};



// Socket handling
var lobby = io.on('connection', function(socket) {
	console.log(socket.id + " connected..");
	pNum++;
	if (p1.socket == null) {
		console.log("Player 1 assigned.");
		p1.socket = socket.id;
		socket.emit("player", 1);
	} else if (p2.socket == null) {
		console.log("Player 2 assigned.");
		p2.socket = socket.id;
		socket.emit("player", 2);
	} else if (p3.socket == null) {
		console.log("Player 3 assigned.");
		p3.socket = socket.id;
		socket.emit("player", 3);
	} else {
		socket.emit("error", "Game is full.");
	}
	
	// Handle directional input
	socket.on("change direction", function(dir) {
		if (socket.id == p1.socket) {
			if (checkDir(dir, p1.direction))
				p1.direction = dir;
		} else if (socket.id == p2.socket) {
			if (checkDir(dir, p2.direction))
				p2.direction = dir;
		} else if (socket.id == p3.socket) {
			if (checkDir(dir, p3.direction))
				p3.direction = dir;
		}
	});

	socket.on("start", function() {
		startGame();
	});

	socket.on("disconnect", function() {
		if (socket.id == p1.socket) {
			p1.socket = null;
		} else if (socket.id == p2.socket) {
			p2.socket = null;
		} else if (socket.id == p3.socket) {
			p3.socket = null;
		}
	});
}); // End connection handler

function startGame() {
	iniBoard();
	clearInterval(renderLoop);
	renderLoop = setInterval(function() {
		render();
	}, 200);
}
function stopGame() {}

function render() {

	// Handle movement of first player
	if (p1.socket != null && p1.dead == false) {

		// Move all the blocks forward one.
		var tempX = p1.snake[0][0];
			tempY = p1.snake[0][1];

		// Move the head first
		// Find out which location we're going to
		if (p1.direction == "down") {
			p1.snake[0][1]++;
		} else if (p1.direction == "left") {
			p1.snake[0][0]--;
		} else if (p1.direction == "up") {
			p1.snake[0][1]--;
		} else {
			p1.snake[0][0]++;
		}

		if (p1.snake[0][0] < 0 || p1.snake[0][0] >= board.length || p1.snake[0][1] < 0 || p1.snake[0][1] >= board.length || board[p1.snake[0][0]][p1.snake[0][1]] != null) {
			p1.dead = true;
			p1.snake[0][0] = tempX;
			p1.snake[0][1] = tempY;
			destroySnake(p1.snake);
		} else {
			board[p1.snake[0][0]][p1.snake[0][1]] = p1.color;
		
			// Loop through da booty
			for (var i = 1; i < p1.snake.length; i++) {
				var locTempX = p1.snake[i][0],
					locTempY = p1.snake[i][1];

				p1.snake[i][0] = tempX;
				p1.snake[i][1] = tempY;

				board[tempX][tempY] = p1.color;

				tempX = locTempX;
				tempY = locTempY;

				if (i == (p1.snake.length - 1) && p1.grow == false) {
					board[tempX][tempY] = null;
				} // Delete the last link if it's not time to grow
				else if (i == (p1.snake.length - 1) && p1.grow == true) {
					p1.grow = false;
					p1.snake.push([tempX, tempY]);
					console.log(p1.snake);
				}
			} // Done loopin through dat booty

		}

	} // End p1 snek update loop


	// Handle movement of second player
	if (p2.socket != null && p2.dead == false) {

		// Move all the blocks forward one.
		var tempX = p2.snake[0][0];
			tempY = p2.snake[0][1];

		// Move the head first
		// Find out which location we're going to
		if (p2.direction == "down") {
			p2.snake[0][1]++;
		} else if (p2.direction == "left") {
			p2.snake[0][0]--;
		} else if (p2.direction == "up") {
			p2.snake[0][1]--;
		} else {
			p2.snake[0][0]++;
		}

		if (p2.snake[0][0] < 0 || p2.snake[0][0] >= board.length || p2.snake[0][1] < 0 || p2.snake[0][1] >= board.length || board[p2.snake[0][0]][p2.snake[0][1]] != null) {
			p2.dead = true;
			p2.snake[0][0] = tempX;
			p2.snake[0][1] = tempY;
			destroySnake(p2.snake);
		} else {
			board[p2.snake[0][0]][p2.snake[0][1]] = p2.color;
		
			// Loop through da booty
			for (var i = 1; i < p2.snake.length; i++) {
				var locTempX = p2.snake[i][0],
					locTempY = p2.snake[i][1];

				p2.snake[i][0] = tempX;
				p2.snake[i][1] = tempY;

				board[tempX][tempY] = p2.color;

				tempX = locTempX;
				tempY = locTempY;

				if (i == (p2.snake.length - 1) && p2.grow == false) {
					board[tempX][tempY] = null;
				} // Delete the last link if it's not time to grow
			} // Done loopin through dat booty
		}
	} // End p2 snek update loop


	// Handle movement of third player
	if (p3.socket != null && p3.dead == false) {

		// Move all the blocks forward one.
		var tempX = p3.snake[0][0];
			tempY = p3.snake[0][1];

		// Move the head first
		// Find out which location we're going to
		if (p3.direction == "down") {
			p3.snake[0][1]++;
		} else if (p3.direction == "left") {
			p3.snake[0][0]--;
		} else if (p3.direction == "up") {
			p3.snake[0][1]--;
		} else {
			p3.snake[0][0]++;
		}

		if (p3.snake[0][0] < 0 || p3.snake[0][0] >= board.length || p3.snake[0][1] < 0 || p3.snake[0][1] >= board.length || board[p3.snake[0][0]][p3.snake[0][1]] != null) {
			p3.dead = true;
			p3.snake[0][0] = tempX;
			p3.snake[0][1] = tempY;
			destroySnake(p3.snake);
		} else {
			board[p3.snake[0][0]][p3.snake[0][1]] = p3.color;
		
			// Loop through da booty
			for (var i = 1; i < p3.snake.length; i++) {
				var locTempX = p3.snake[i][0],
					locTempY = p3.snake[i][1];

				p3.snake[i][0] = tempX;
				p3.snake[i][1] = tempY;

				board[tempX][tempY] = p3.color;

				tempX = locTempX;
				tempY = locTempY;

				if (i == (p3.snake.length - 1) && p3.grow == false) {
					board[tempX][tempY] = null;
				} // Delete the last link if it's not time to grow
			} // Done loopin through dat booty
		}
	} // End p3 snek update loop

	// Check for le starzors.
	var locChk = board[starLoc[0]][starLoc[1]];
	if (locChk != null) {
		if (locChk == p1.color) {
			p1.grow = true;
		}
		else if (locChk == p2.color) {
			p2.grow = true;
		}
		else if (locChk == p3.color) {
			p3.grow = true;
		}

		genStar();
	}

	lobby.emit("render", [board, starLoc]);
} // End renderloop

// Function to destroy a motherfucker.
function destroySnake(arr) {
	for (var i = 0; i < arr.length; i++) {
		board[arr[i][0]][arr[i][1]] = null;
	}
} // End motherfucking destruction


// No backtracking, backtracking is for h4xorz
function checkDir(newD, oldD) {
	if ((newD == "down" && oldD == "up") || (newD == "up" && oldD == "down")) {
		return false;
	} else if ((newD == "left" && oldD == "right") || (newD == "right" && oldD == "left")) {
		return false;
	} else {
		return true;
	}

} // Done checking for h4xzors...


// Ini dat board.
function iniBoard() {

	// Set up sneks...
	if (p1.socket != null) {
		for (var i = 0; i < p1.snake.length; i++) {
			board[p1.snake[i][0]][p1.snake[i][1]] = p1.color;
		}
	}
	if (p2.socket != null) {
		for (var i = 0; i < p2.snake.length; i++) {
			board[p2.snake[i][0]][p2.snake[i][1]] = p2.color;
		}
	}
	if (p3.socket != null) {
		for (var i = 0; i < p3.snake.length; i++) {
			board[p3.snake[i][0]][p3.snake[i][1]] = p3.color;
		}
	}

	// Give em something to fight over..
	genStar();

} // End board ini


// Get a star in a motherfucker.
function genStar() {
	starLoc[0] = Math.floor(Math.random() * 10);
	starLoc[1] = Math.floor(Math.random() * 10);
} // No more motherfucking stars motherfucker.



http.listen(3001, console.log("Listening on *:3001"));