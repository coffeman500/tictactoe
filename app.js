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
			if (activeGame != null) {
				lobby.to(socket.id).emit('redirect', '/pregame');
				return;
			}
			if (!m_users.isConnected(username)) {
				m_users.addConnUser(username, socket.id);
				lobby.emit('users change', m_users.getUsers(lobby));
			}
			else {
				lobby.to(socket.id).emit('validation error', { 
					"msg": 'It seems you\'re already logged in..',
					"url": '/'
				});
			}
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


	// Handles join game requests
	socket.on('join game', function(data) {
		m_sh.joinGame(lobby, socket.id, data);
	});
	
	
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
			if (!m_users.isConnected(username)) {
				m_users.addConnUser(username, socket.id);
				// Send em off to the room they belong in
				m_pregame.connect(pregame, username, activeGame, socket.id, function(success, room) {
					if (success) {
						socket.join(room);
						// Send out connected users list
						pregame.to(room).emit('users change', m_users.getUsers(pregame, room));
						// Send out ready users list
						m_pregame.getReadyPlayers(room, function(players) {
							pregame.to(room).emit('ready change', players);
						});
					}
				});
			}
			else {
				pregame.to(socket.id).emit('validation error', { 
					"msg": 'It seems you\'re already logged in..',
					"url": '/'
				});
			}
		});
	}); // End connection handler


	// Handles chat messages
	socket.on('chat message', function(data) {
		m_sh.chat(pregame, data, socket.id);
	}); // End chat message handler


	// Handles ready requests
	socket.on('ready player', function(token) {
		m_pregame.readyPlayer(pregame, socket.id, token, function(success, msg, activeGame) {
			if (success) {
				m_pregame.getReadyPlayers(activeGame, function(players) {
					pregame.to(activeGame).emit('ready change', players);
				});
			}
			else {
				pregame.to(socket.id).emit('error', { "msg": msg });
			}
		});
	}); // End ready handler


	// Handles unready requests
	socket.on('unready player', function(token) {
		m_pregame.unreadyPlayer(pregame, socket.id, token, function(success, msg, activeGame) {
			if (success) {
				m_pregame.getReadyPlayers(activeGame, function(players) {
					pregame.to(activeGame).emit('ready change', players);
				});
			}
			else {
				pregame.to(socket.id).emit('error', { "msg": msg });
			}
		});
	}); // End unready handler


	// Handles returning the list of ready players
	socket.on('get readys', function(token) {
		jwt.verify(token, pKey(), function(err, decoded) {
			if (err) {
				lobby.to(socket).emit('validation error', {
					"msg": 'Your session token is invalid, try logging in again.',
					"url": '/'
				});
			}
			else {
				pregame.to(socket.id).emit('ready change', m_pregame.getReadyPlayers(decoded.activeGame));
			}
		});
	}); // End handler of returning users


	// Handles toggling a match open and closed
	socket.on('toggle match', function(token) {
		m_pregame.toggleMatchOpen(pregame, socket.id, token, lobby);
	}); // Finish match toggling opener thing


	// Handles leaving the game lobby
	socket.on('leave game', function(token) {
		m_pregame.leaveGame(pregame, socket.id, token, lobby);
	});

	// TODO: Join game function and the game itself

	socket.on('disconnect', function() {

	});
});

http.listen(3000, console.log("Listening on *:3000"));