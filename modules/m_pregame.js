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
exports.connect = function(io, username, activeGame, socket, callback) {
	// Attempt to join the match
	m_mongo.joinGame(activeGame, username, function(success, msg) {
		if (success) {
			return callback(true, activeGame);
		}
		else {
			activeGame = null;
			jwt.sign({
				"username": username,
				"activeGame": activeGame 
			}, pKey(), { "expiresIn": "1 day" }, function(token) {
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

}; // End of function.



// Function to remove a user from a game
exports.disconnect = function() {
	// Need to check if the game has started or not.
	// If the game hasn't started then 
}