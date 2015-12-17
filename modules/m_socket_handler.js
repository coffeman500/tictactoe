// Some Modules, yo.
var m_login = require('./m_login');
var m_mongo = require('./m_mongo');
var jwt = require('jsonwebtoken');
var pKey = require('./m_key.js');


// Function to handle login attempt
// Takes two variables:
//		io: socket.io connection to push data through
//		data: login data from the client
//
// No return, communicates with the client directly
exports.login = function(io, data) {
	// Token returns null on failed login attempt, else it returns a signed token for future use
	m_login(data.username, data.password, function(token) {
		
		// Handle what we pass back.
		if (!token) {
			io.to(data.socket).emit('error', 'Username or Password are incorrect');
		}			
		else  { 
			io.to(data.socket).emit('login', {
				"token": token,
				"username": data.username,
				"url": '/lobby'
			});
		}
	
	});
};



// Function to handle account creation
// Takes two variables:
//		io: socket.io connection to push data through
//		data: account creation data from the client
//
// No return, communicates with the client directly
exports.createAccount = function(io, data) {
	// We'll start by making sure the username doesn't contain anything illegal
	var usrErr = checkUsername(data.username, data.password);
	if (usrErr)
		return io.to(data.socket).emit('error', usrErr);
		

	// Query the db to see if user exists already
	m_mongo.returnFromDb('users', {
		"username": data.username
	}, function(user) {
				
		if (user) {
			io.to(data.socket).emit('error', 'Username is taken');
		}
		else {
			// Query the db to create an account
			m_mongo.createAccount(data.username, data.password, function(response) {
				if (response) {
					io.to(data.socket).emit('create account', {
						"status": "true",
						"redirect": "/"
					});
				}
				else {
					io.to(data.socket).emit('error', 'Something went wrong. Try again later.');
				}
			});
		}
		
	});
	
	// Function to check if user data is correct
	function checkUsername(username, password) {
		if (/^[a-zA-Z0-9-s]*$/.test(username) == false) 
			return 'Special characters aren\'t allowed in usernames';
		if (username.length <= 3)
			return 'Usernames need to be at least 4 characters long';
		if (password.length <= 4)
			return 'Passwords need to be at least 5 characters long';
	}
	
};



// This function verifys a received token
// Takes two variables:
//		io: the socket to send responses to
//		data: 
//			.token: user's auth token
//			.username: pretty self explanatory..
//			.socket: user's socket, yo.
//
// Retruns true on successful verification Sends error message to client on fail
exports.verifyToken = function(io, data) {
	// Start by verifying the token
	jwt.verify(data.token, pKey(), function(err, decoded) {
	
		if (err || !(decoded == '"' + data.username + '"')) {
			console.log(err);
			io.to(data.socket).emit('validation error', {
				"msg": 'It seems you don\'t belong here, you should try logging in again.',
				"url": '/'
			});
		} else {
			return true;
		}
			
	});
	
};



// Function to handle retrieval of open games
// Input:
//		io: socket to respond to client on
//
// Sends list of open games back to client in json format
exports.getGames = function(io, socket) {
	m_mongo.getAllFromDb('games', { "open": true }, function(games) {
		io.to(socket).emit('get games', games);
	});
};







