// Some packages we're going to need
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Import our own modules:
var m_sh = require('./modules/m_socket_handler');
var m_pregame = require('./modules/m_pregame');



// Routing
app.use(express.static(__dirname + '/html/assets'));

// Home page, server login page
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/html/login.html');

});

// Registration page
app.get('/register', function(req, res) {
	res.sendFile(__dirname + '/html/register.html');
});

// Lobby page
app.get('/lobby', function(req, res) {
	res.sendFile(__dirname + '/html/lobby.html');
});

// Pregame lobby page
app.get('/pregame', function(req, res) {
	res.sendFile(__dirname + '/html/pregame.html');
});



// Socket handling
io.on('connection', function(socket) {

	// Controls login attempts
	socket.on('login', function(data) {
		m_sh.login(io, data);
	}); // End login handler	
	
	
	// Controls account creation
	socket.on('create account', function(data) {
		m_sh.createAccount(io, data);
	}); // End account creation handler
	
}); // End connection handler


// Handles lobby group
var lobbyUsers = [];
var lobby = io.of('/lobby').on('connection', function(socket) {
	// Handles token verification from a connecting user
	socket.on('lobby connect', function(data) {
		m_sh.verifyToken(lobby, data);
		// Push the user into the array of connected users
		lobbyUsers.push({ 
			"socket": data.socket,
			"username": data.username		
		});
		// Tell everyone else someone joined. Happy happy joy joy.
		lobby.emit('users change', JSON.stringify(lobbyUsers, ['username']));
	}); // End token verification handler

	
	// Sends out game list to everyone periodically, and individually by request
	socket.on('get games', function(socket) {
		m_sh.getGames(lobby, socket);
	}); // End list open games handler
	
	
	// Handles chat messages
	socket.on('chat message', function(data) {
		m_sh.chat(lobby, data, socket.id);
	}); // End chat message handler
	
	
	// Handles game hosting requests
	socket.on('host game', function(data) {
		m_sh.createGame(lobby, data, socket.id, function(token) {
			if (token) {
				lobby.to(socket.id).emit('hosted ready', {
					"newToken": token,
					"url": '/pregame',
					"msg": 'Your game is ready! Redirecting you now...'
				});
			}
		});
	});
	
	socket.on('disconnect', function() {
		var removeIndex = null;
		// Loops through the logged in users list until the disconnected socket is found, then it is removed
		for (var i = 0; i<lobbyUsers.length; i++) {
			if (lobbyUsers[i].socket == socket.id) {
				removeIndex = i;
				break;
			}
		}
		lobbyUsers.splice(removeIndex, 1);
		// Tell everyone else someone joined. Happy happy joy joy.
		lobby.emit('users change', JSON.stringify(lobbyUsers, ['username']));
	});
}); // End lobby connection handler



// This is the pregame lobby
var pregame = io.of('/pregame').on('connection', function(socket) {

	// TODO: hostgame and joingame problem - if already joined doesnt need to rejoin
	socket.on('pregame connect', function(token) {
		m_sh.verifyToken(lobby, data);
		m_pregame.connect(pregame, token, socket.id, function(success, room) {
			if (success) {
				socket.join(room);
			}
		});
	});


	// TODO: manage disconencting users
	//		Check game from database to see if it has started
	//		if it hasn't then the user has just left the pregame so remove him from the game
	//		it if has then the user has been moved into the game lobby
	//socket.on('disconnect')
});

http.listen(3000, console.log("Listening on *:3000"));














