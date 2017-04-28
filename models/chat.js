"use strict"
var Database = require('./database');
var db = new Database();
var Session = require('./session');
var session = new Session();
var http_codes = require('http-status-codes');

class Chat {
	get(id, user_session, callback) {
		var query_string = "SELECT id, name FROM chats";
		var values = [id];
		var query = db.build_query(query_string, values);

		db.connection.query(query, (error, results, fields) => {
        if (error) {
            var error = new Error(error)
            error.code = http_codes.NOT_FOUND;
            return callback(error);
        } else {
        		var return_object = {
        			user_session: user_session,
        			chats: results
        		}
            return callback(null, return_object);
        }
    })
	}
	create(chat_info, callback) {
    var query_string = "INSERT INTO chats (name, created_at, updated_at) VALUES(?, NOW(), NOW())"
    var values = [chat_info.channel_name]
    var query = db.build_query(query_string, values);

    db.connection.query(query, (error, results, fields) => {
        if (error) {
            var error = new Error(error)
            error.code = http_codes.NOT_FOUND;
            return callback(error);
        } else {
            return callback(null, results);
        }
    })
  }
}

module.exports = Chat;