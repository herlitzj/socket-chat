"use strict"

var assert = require('assert');
var async = require('async');

var Database = require('../models/database');
var db = new Database();

var Chat = require('../models/chat');
var chat = new Chat();

// general setup
var test_id = 2147483647 //largest id available on our db
var test_name = "test_chat_name"

var cleanup = function(done) {
	var cleanup_query = "DELETE FROM chats WHERE id = " + test_id
	var auto_increment_query = "ALTER TABLE chats AUTO_INCREMENT = 1"

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
	describe('#get_channels()', function() {

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
		        	var expected = result.chats.pop().name;
		            assert.equal(expected, test_name);
		            done()
		        }
		    }
			chat.get_channels(test_id, mock_session, callback);
		});
	  
	});

});





