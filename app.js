// Some packages we're going to need
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Import our own modules:
var m_sh = require('./modules/m_socket_handler');
var m_pregame = require('./modules/m_pregame');
var m_users = require('./modules/m_users');



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
		if (!m_users.isConnected(data.username))
			m_sh.login(io, data);
		else 
			io.to(data.socket).emit('error', 'It seems you\'re already connected..');
	}); // End login handler	
	
	
	// Controls account creation
	socket.on('create account', function(data) {
		m_sh.createAccount(io, data);
	}); // End account creation handler
	
	socket.on('disconnect', function() {
		m_users.removeConnUser(socket.id);
	});
}); // End connection handler



// Lobby room
var lobby = io.of('/lobby').on('connection', function(socket) {

	// Handles token verification from a connecting user
	socket.on('lobby connect', function(token) {
		m_sh.verifyToken(lobby, token, socket.id, function(username, activeGame) {
			// TODO: If active game isn't null, then redirect user to the game lobby
			m_users.addConnUser(username, socket.id);
			lobby.emit('users change', m_users.getUsers(lobby));
		});
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
	
	// TODO: Join functionality from the lobby page

	socket.on('disconnect', function() {
		// Tell everyone else someone left. Sad sad tears tears.
		lobby.emit('users change', m_users.getUsers(lobby));
	});
}); // End lobby connection handler



// This is the pregame lobby
var pregame = io.of('/pregame').on('connection', function(socket) {

	// Handles pregame connection
	socket.on('pregame connect', function(token) {
		m_sh.verifyToken(lobby, token, socket.id, function(username, activeGame) {
			m_users.addConnUser(username, socket.id);
			// Send em off to the room they belong in
			m_pregame.connect(pregame, username, activeGame, socket.id, function(success, room) {
				if (success) {
					socket.join(room);
					pregame.to(room).emit('users change', m_users.getUsers(pregame, room));
				}
			});
		});
	});

	// TODO: Finish handling loading content on the pregame page

	// TODO: manage disconencting users
	//		Check game from database to see if it has started
	//		if it hasn't then the user has just left the pregame so remove him from the game
	//		it if has then the user has been moved into the game lobby
	socket.on('disconnect', function() {

	});
});

http.listen(3000, console.log("Listening on *:3000"));














