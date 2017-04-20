"use strict"

var assert = require('assert');

var Database = require('../models/database');
var db = new Database();

var User = require('../models/user');
var user = new User();

// general setup
var test_id = 2147483647 //largest id available on our db
var test_values = [test_id, "test", "user", "test@test.com", "test_user", null, "test_hash_pw"]

var cleanup = function(callback) {
	var cleanup_query = "DELETE FROM users WHERE id = " + test_id
	db.connection.query(cleanup_query, (error, results, fields) => {
		if(error) console.log(error);
		else callback();
	})
}

var insert_user = function(callback) {
	var base_query = "INSERT INTO users (id, first_name, last_name, email, username, created_at, updated_at, timezone, hashed_pw) VALUES(?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)";
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

		describe("#create()", function() {
			it('should properly create a new user', function(done) {
				var mock_session = {user: test_id};
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
					else user.get(test_id, mock_session, get_callback);
				}

				user.create(create_values, mock_session, get_user)
			});
		})
	})
});





