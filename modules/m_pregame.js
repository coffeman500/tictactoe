// This is the file for handleing pregame requests
// Gonna need a few of these modules
var m_login = require('./m_login');
var m_mongo = require('./m_mongo');
var jwt = require('jsonwebtoken');
var pKey = require('./m_key.js');

// Now the fun may begin:

// Function to handle pregame connections
// Variables:
//		io: the main socket to blast to
//		token: the user's auth token, contains variables after decryption
//			.username: the user's username
//			.activeGame: user's active game, if there is one
//		socket: the user's socket
//		callback: the callback function
//
// Returns two varibles in the callback, success (true on success), and the new room name to connect the user to
exports.connect = function(io, token, socket, callback) {
	// Start by authing the shit out of this sexy token.
	jwt.verify(token, pKey(), function(err, decoded) {
		// On validation error:
		if (err) {
			console.log(err || !(decoded.activeGame))
			io.to(socket).emit('validation error', {
				"msg": 'It seems you don\'t belong here. Try logging in again.',
				"url": '/'
			});
			return callback(false);
		}
		// Attempt to join the match
		m_mongo.joinGame(decoded.activeGame, decoded.username, function(success, msg) {
			if (success) {
				return callback(true, decoded.activeGame);
			}
			else {
				decoded.activeGame = null;
				jwt.sign(decoded, pKey(), { "expiresIn": "1 day" }, function(token) {
					if (!token) {
						io.to(socket).emit('validation error', {
							"msg": 'Something horrible went wrong.. Try logging in again',
							"url": '/'
						});
					}
					else {
						io.to(socket).emit('join error', {
							"msg": msg,
							"url": '/lobby',
							"token": token
						});
					}
					//return callback(false);
				});
			} // End of failed join

		}); // End of mongo connection

	}); // End of original jwt verify

}; // End of function.