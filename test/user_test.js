"use strict"

var assert = require('assert');
var async = require('async');

var Database = require('../models/database');
var db = new Database();

var User = require('../models/user');
var user = new User();

// general setup
var test_id = 2147483647 //largest id available on our db
var test_values = [test_id, "test", "user", "test@test.com", "funkytown", null, "test_hash_pw"]
const USER_TABLE_NAME = 'users';

var cleanup = function(done) {
	var cleanup_query = "DELETE FROM users WHERE username in ('funkytown', 'update_user', 'created_user')";
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

describe('User', function() {
	describe('#get() and #update()', function() {

		beforeEach(function(done) {
			insert_user(done);
		});

		afterEach(function(done) {
			cleanup(done);
		});


		it('should get the user and user info', function(done) {
			var mock_session = {user: test_id};
			var callback =  (err, result) => {
		        if (err) {
		            console.log(err);
		        } else {
		        	console.log(result)
		            assert.equal(result[0].first_name, test_values[1]);
		            assert.equal(result[0].last_name, test_values[2]);
		            assert.equal(result[0].email, test_values[3]);
		            assert.equal(result[0].username, test_values[4]);
		            done()
		        }
		    }
			user.get(test_id, mock_session, callback);
		});

		it('should properly update the user info', function(done) {
			var mock_session = {user: test_id};
			var update_values = {
				first_name: "updated",
				last_name: "person",
				username: "update_user",
				email: "updated@test.com",
				id: test_id
			}
			var get_user = (error, result) => {
				var get_callback =  (err, res) => {
			        if (err) {
			            console.log(err);
			        } else {
			            assert.equal(res[0].first_name, update_values.first_name);
			            assert.equal(res[0].last_name, update_values.last_name);
			            assert.equal(res[0].email, update_values.email);
			            assert.equal(res[0].username, update_values.username);
			            done()
			        }
			    }

			    if(error) console.log(error)
				else user.get(test_id, mock_session, get_callback);
			}

			user.update(update_values, get_user)
		});
	  
	});

	describe('#create()', function() {

		afterEach(function(done) {
			cleanup(done);
		});

		it('should properly create a new user', function(done) {
			var mock_session = {};
			var create_values = {
				first_name: "created",
				last_name: "user",
				username: "created_user",
				email: "created@test.com",
				password: "password"
			}
			var get_user = (error, result) => {
				var get_callback =  (err, res) => {
			        if (err) {
			            console.log(err);
			        } else {
			            assert.equal(res[0].first_name, create_values.first_name);
			            assert.equal(res[0].last_name, create_values.last_name);
			            assert.equal(res[0].email, create_values.email);
			            assert.equal(res[0].username, create_values.username);
			            done();
			        }
			    }

			    if(error) console.log(error)
				else user.get(result.insertId, mock_session, get_callback);
			}

			user.create(create_values, mock_session, get_user)
		});
	})

});





