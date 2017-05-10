"use strict"

var assert = require('assert');

var Database = require('../models/database');
var db = new Database();

var Chat = require('../models/chat');
var chat = new Chat();

// general setup
var test_id = 2147483647 //largest id available on our db
var test_name = "test_chat_name"

var cleanup = function(callback) {
	var cleanup_query = "DELETE FROM chats WHERE id = " + test_id
	db.connection.query(cleanup_query, (error, results, fields) => {
		if(error) console.log(error);
		else callback();
	})
}

var insert_chat = function(callback) {
	var base_query = "INSERT INTO chats" +
					 " (id, name, created_at, updated_at) VALUES(?, ?, NOW(), NOW())";
	var insert_query = db.build_query(base_query, [test_id, test_name]);
	db.connection.query(insert_query, (error, results, fields) => {
		if(error) console.log(error);
		else callback();
	})
}

describe('Chat', function() {
	describe('#get()', function() {

		beforeEach(function(done) {
			insert_chat(done);
		});

		afterEach(function(done) {
			cleanup(done);
		});


		it('should get all the active chats', function(done) {
			var mock_session = {user: 1};
			var callback =  (err, result) => {
		        if (err) {
		            console.log(err);
		        } else {
		        	console.log(result)
		            assert.equal(result.chats[0].name, test_name);
		            done()
		        }
		    }
			chat.get(test_id, mock_session, callback);
		});
	  
	});

});





