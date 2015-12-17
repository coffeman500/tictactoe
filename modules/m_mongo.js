// MongoDB Modules
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectId;
var url = ('mongodb://localhost:27017/tictactoe');

// Some Auth Modules
var sha256 = require('js-sha256');
var randomToken = require('random-token').create('abcdefghijklmnopqrstuvwxzyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');



// Function to return a value from the database
// Takes two variables:
// 		coll : The collection to search in
//		query : The query to search for
//		
// Returns a single document that matches the search, or null if no document was found
exports.returnFromDb = function(coll, query, callback) {

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		
		getDoc(db, function(data) {
			callback(data);
		});		
	});
	
	function getDoc(db, callback) {
		// Find the user in the database
		db.collection(coll).findOne(query, function(err, doc) {
			callback(doc);
			db.close();
		});
		
	}

};



// Function to return all matching documents from db
// Takes three variables:
//		coll: the collection to search in
//		query: the term to search for
//		callback: the callback function
//
// Returns a cursor containing all matching documents on success
exports.getAllFromDb = function(coll, query, callback) {
	
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		
		db.collection(coll).find(query, function(err, cursor) {
			assert.equal(null, err);

			cursor.toArray(function(err, arr) {
				callback(arr);
				db.close();
			});

		});	
	});
	
};


// Function to create an account
// Takes two variables:
//		user: the username for the account
//		pass: the password for the account
//
// Returns true if user added, else returns false
exports.createAccount = function(user, pass, callback) {
	
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		
		addAccount(db, function(result) {
			callback(result);
		});
	});
	
	function addAccount(db, callback) {
		// Time to get salty.
		var salt = randomToken(16);
		// Salt n hash them browns
		var hashedPass = sha256(salt + pass);		
		
		// Add the user to the database
		var result = db.collection('users').insert({
			"username": user,
			"password": hashedPass,
			"salt": salt
		}, function(err, result) {
			if (!err)
				callback(true);
			else 
				callback(false);
			db.close();
		});
	}
	
};













