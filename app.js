// Some packages we're going to need
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Import our own modules:
var m_sh = require('./modules/m_socket_handler');



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
	console.log('User connected to chat');
	// Handles token verification from a connecting user
	socket.on('lobby connect', function(data) {
		m_sh.verifyToken(lobby, data);
		
		lobbyUsers.push({ 
			"socket": data.socket,
			"username": data.username		
		});
	}); // End token verification handler

	
	// Sends out game list to everyone periodically, and individually by request
	socket.on('get games', function(socket) {
		m_sh.getGames(lobby, socket);
	}); // End list open games handler
	
	
	socket.on('disconnect', function() {
		var removeIndex = null;
		// Loops through the logged in users list until the disconnected socket is found, then it is removed
		for (var i = 0; i<lobbyUsers.length; i++) {
			if (lobbyUsers[i].socket == socket) {
				removeIndex = i;
				break;
			}
		}
		lobbyUsers.splice(removeIndex, 1);
		// TODO: Send connected users back to all clients so they can update users in lobby
	});
}); // End lobby connection handler



http.listen(3000, console.log("Listening on *:3000"));














