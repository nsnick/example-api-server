let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');

let User = require('../models/user'); 
let config = require('../config');



exports.register = function(username, email, password, callback) {
	User.findOne({
		'username': username
	}, function(err, user1) {
		if (!user1) {
			User.findOne({
				'email': email
			}, function(err, user2) {
				if (!user2) {
					bcrypt.genSalt(10, function(err, salt) {
						bcrypt.hash(password, salt, function(err, pwhash) {
							var newUser = new User({
								'name': username,
								'email': email,
								'password': pwhash,
								'admin': false
							});
							newUser.save(function(err) {
								if (err) {
									callback('Error creating user');
									return;
								} else {
									callback(null);
									return;
								}
							});
						});
					});
				} else {
					callback('Email already in use');  
					return;                 
				}
			});
		} else {
			callback('User name already in use');
			return;
		}    
	});
};


exports.login = function (username, password, callback) {
	User.findOne({
		name: username
	}, function(err, user) {

		if (err) {
			callback('Error finding user', null);	
			return;
		}

		if (!user) {
			callback('Authentication failed. User not found.', null);
			return;
		} else if (user) {
			var hash = user.password;
			bcrypt.compare(password, hash, function(err, doesMatch) {
				if (doesMatch) {
					var token = jwt.sign(user, config.secret, {
						expiresIn : 60*60*24 // expires in 24 hours
					});
					callback(null, token);
					return;
				} else { 
					callback('Authentication failed. Wrong password.', null);
					return;
				}
			});
		}
	});
};


exports.verify = function (token, callback) {
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, config.secret, function(err, decoded) {      
			if (err) {
				callback('Failed to authenticate token.', null);   
				return; 
			} else {
				callback(null, decoded);
				return;
			}
		});
	} else {
		callback('No token provided', null);
		return;
	}	
};




