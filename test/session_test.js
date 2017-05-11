"use strict"

var assert = require('assert');
var async = require('async');

var Database = require('../models/database');
var db = new Database();

var Session = require('../models/session');
var session = new Session();

// general setup
var test_id = 2147483647 //largest id available on our db
var test_username = 'funkytown';
var test_password = 'password'; // this will hash to the below hash. If you change the password, you need to generate a new hash
var test_hash = 'pbkdf2$10000$af6ab57d9cfe9937ff2898eb70921c84867648c214fc35c1619df3471344771910271731669b20c321e78089cda953520826c810cc89769c8578b42fc025672a$302e1983c4cd5d1c2a414ff384e4d55a3a6574db0cf9013fdfad684e818d2d7e214dfc95fdf95dc3d5274bf370cc44f428e18eebea464e1f1eff46725aca7103'

var test_values = [test_id, "test", "user", "test@test.com", test_username, null, test_hash]

var cleanup = function(done) {
	var cleanup_query = "DELETE FROM users WHERE id = " + test_id
	var auto_increment_query = "ALTER TABLE users AUTO_INCREMENT = 1"

	async.series([
	    function(callback){
	        db.connection.query(cleanup_query, (error, results, fields) => {
				if(error) console.log(error);
				callback();
			})
	    },
	    function(callback){
	        db.connection.query(auto_increment_query, (error, results, fields) => {
				if(error) console.log(error);
				callback();
			})
	    }
	],
	function(err, results){
	    if(err) console.log(err);
		else done();
	});
}

var insert_user = function(callback) {
	var base_query = "INSERT INTO users" + 
					 " (id, first_name, last_name, email, username, created_at, updated_at, timezone, hashed_pw) VALUES(?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)";
	var insert_query = db.build_query(base_query, test_values);
	db.connection.query(insert_query, (error, results, fields) => {
		if(error) console.log(error);
		else callback();
	})
}

describe('Session', function() {
  describe('#login()', function() {

  	beforeEach(function(done) {
		insert_user(done);
	});

	afterEach(function(done) {
		cleanup(done);
	});

    it('should properly verify a legitimate user', function(done) {
    	var mock_session = {user: test_id};
		var callback =  (err, result) => {
	        if (err) {
	            console.log("TESTING ERROR: ", err);
	        } else {
	            assert.equal(result.validated, true);
	        }
	        done();
	    }
		session.login(test_username, test_password, mock_session, callback);
    });

    it('should reject a bad username', function(done) {
    	var mock_session = {user: test_id};
		var callback =  (err, result) => {
	        if (err) {
	            console.log("TESTING ERROR: ", err);
	        } else {
	            assert.equal(result.validated, false);
	        }
	        done();
	    }
		session.login("wrong_username", test_password, mock_session, callback);
    })

    it('should reject a bad password', function(done) {
    	var mock_session = {user: test_id};
		var callback =  (err, result) => {
	        if (err) {
	            console.log("TESTING ERROR: ", err);
	        } else {
	            assert.equal(result.validated, false);
	        }
	        done();
	    }
		session.login(test_username, "wrong_password", mock_session, callback);
    })
  });
});