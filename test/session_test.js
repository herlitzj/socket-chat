// "use strict"

// var assert = require('assert');

// var Database = require('../models/database');
// var db = new Database();

// var Session = require('../models/session');
// var session = new Session();

// // general setup
// var test_id = 2147483647 //largest id available on our db
// var test_username = 'test_user';
// var test_password = 'password'; // this will hash to the below hash. If you change the password, you need to generate a new hash
// var test_hash = 'pbkdf2$10000$8a4409fd1e4124c20613ae2e3b615bd4a195467e81885303c8136312adcac5c6316dd39836bfc85fff204fb936573eefc5e51499a0a6698500277569c38330ea$df3923c75146aaac182e25be751ef2eab0d8381dba624c5e4f7c30335c8f30150d6621825b99e376cd7c73ac267294b78961cf17a2d895766e197d0eb8f2e205'
// const USER_TABLE_NAME = 'users';
// const TEST_USER_TABLE_NAME = 'TEST_' + USER_TABLE_NAME;

// var test_values = [test_id, "test", "user", "test@test.com", test_username, null, test_hash]

// var cleanup = function(callback) {
// 	var cleanup_query = "DELETE FROM " + TEST_USER_TABLE_NAME + " WHERE id = " + test_id
// 	db.connection.query(cleanup_query, (error, results, fields) => {
// 		if(error) console.log(error);
// 		else callback();
// 	})
// }

// var insert_user = function(callback) {
// 	var base_query = "INSERT INTO " + TEST_USER_TABLE_NAME + 
// 					 " (id, first_name, last_name, email, username, created_at, updated_at, timezone, hashed_pw) VALUES(?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)";
// 	var insert_query = db.build_query(base_query, test_values);
// 	db.connection.query(insert_query, (error, results, fields) => {
// 		if(error) console.log(error);
// 		else callback();
// 	})
// }

// describe('Session', function() {
//   describe('#login()', function() {

//   	before(function(done) {
// 		db.copy_table(USER_TABLE_NAME, done);
// 	});

// 	after(function(done) {
// 		db.delete_table(TEST_USER_TABLE_NAME, done);
// 	});

//   	beforeEach(function(done) {
// 		insert_user(done);
// 	});

// 	afterEach(function(done) {
// 		cleanup(done);
// 	});

//     it('should properly verify a legitimate user', function(done) {
//     	var mock_session = {user: test_id};
// 		var callback =  (err, result) => {
// 	        if (err) {
// 	            console.log(err);
// 	        } else {
// 	            assert.equal(result.validated, true);
// 	        }
// 	        done();
// 	    }
// 		session.login(test_username, test_password, mock_session, callback);
//     });

//     it('should reject a bad username', function(done) {
//     	var mock_session = {user: test_id};
// 		var callback =  (err, result) => {
// 	        if (err) {
// 	            console.log(err);
// 	        } else {
// 	            assert.equal(result.validated, false);
// 	        }
// 	        done();
// 	    }
// 		session.login("wrong_username", test_password, mock_session, callback);
//     })

//     it('should reject a bad password', function(done) {
//     	var mock_session = {user: test_id};
// 		var callback =  (err, result) => {
// 	        if (err) {
// 	            console.log(err);
// 	        } else {
// 	            assert.equal(result.validated, false);
// 	        }
// 	        done();
// 	    }
// 		session.login(test_username, "wrong_password", mock_session, callback);
//     })
//   });
// });