"use strict"
var Database = require('./database');
var db = new Database();
var Session = require('./session');
var session = new Session();
var http_codes = require('http-status-codes');

class Chat {
	get_channels(id, user_session, callback) {
		var query_string = "SELECT id, name FROM chats";
		var values = [id];
		var query = db.build_query(query_string, values);

		db.connection.query(query, (error, results, fields) => {
            if (error) {
                var err = new Error(error)
                err.code = http_codes.NOT_FOUND;
                return callback(err);
            } else {
        		var return_object = {
        			user_session: user_session,
        			channels: results
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
            var err = new Error(error)
            err.code = http_codes.NOT_FOUND;
            return callback(err);
        } else {
            return callback(null, results);
        }
    })
  }
  get_history(id, callback) {
    var query_string = "SELECT cl.line_text, u.username, u.avatar, cl.created_at FROM chat_lines cl " +
                       "JOIN users u " +
                       "ON cl.user_id = u.id " +
                       "WHERE cl.chat_id = ? " +
                       "ORDER BY cl.created_at " +
                       "LIMIT 100";
    var values = [id];
    var query = db.build_query(query_string, values);

    db.connection.query(query, (error, results, fields) => {
        if(error) {
            var err = new Error(error);
            err.code = http_codes.NOT_FOUND;
            return callback(err);
        } else {
            return callback(null, results);
        }
    })
  }
}

module.exports = Chat;