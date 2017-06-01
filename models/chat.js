"use strict"
var Database = require('./database');
var db = new Database();
var Session = require('./session');
var session = new Session();
var http_codes = require('http-status-codes');

class Chat {
	get_channels(id, user_session, callback) {
		var query_string = "SELECT id, name FROM chats WHERE name != 'direct_message'";
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
    var query_string = "SELECT cl.line_text, u.username, u.avatar, DATE_FORMAT(cl.created_at,'%b %d %h:%i %p') created_at FROM chat_lines cl " +
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
  mark_inactive(user_id, chat_id, callback) {
    var query_string = "DELETE FROM chat_participants WHERE user_id = ? AND chat_id = ?";
    var values = [user_id, chat_id];
    var query = db.build_query(query_string, values);

    db.connection.query(query, (error, results, fields) => {
        if (error) {
            var err = new Error(error)
            err.code = http_codes.NOT_FOUND;
            return callback(err);
        } else {
            return callback(null);
        }
    })
  }
  get_direct_messages(user_id, callback) {
    var query_string = "SELECT c.id, group_concat(u.username SEPARATOR ', ') name, count(u.username) + 1 participants\n" +
                        "FROM chats c\n" +
                        "JOIN chat_participants cp\n" +
                        "ON cp.chat_id = c.id\n" +
                        "JOIN users u\n" +
                        "ON cp.user_id = u.id\n" +
                        "WHERE cp.chat_id IN (SELECT distinct chat_id FROM chat_participants WHERE user_id = ?) AND cp.user_id != ?\n" +
                        "GROUP BY c.id;";
    var values = [user_id, user_id];
    var query = db.build_query(query_string, values);

    db.connection.query(query, (error, results, fields) => {
        if (error) {
            var err = new Error(error)
            err.code = http_codes.NOT_FOUND;
            return callback(err);
        } else {
            results.forEach(result => {
                result.truncated_name = result.name.length > 25 ? result.name.slice(0,25) + "..." : result.name;
                //if(result.truncated_name == result.name) result.participants = null;
				result.participants = (result.name.indexOf(",") >= 0);
            })
            return callback(null, results);
        }
    })
  }
  create_direct_message(chat_participants, username, callback) {
    if(!chat_participants.includes(username)) chat_participants = chat_participants + ', ' + username; //add current user if not already in string
    var chatParticipantsArray = Chat.get_user_array_from_string(chat_participants);

    db.connection.beginTransaction(function(err) {
      if (err) { throw err; }
      db.connection.query('INSERT INTO chats (name, created_at, updated_at) VALUES (?, NOW(), NOW())', 'direct_message', function (error, results, fields) {
        if (error) {
          return db.connection.rollback(function() {
            console.log("Error creating chat for direct message");
            throw error;
          });
        }

        var chat_id = results.insertId;
        var query_string = "INSERT INTO chat_participants (chat_id, user_id, created_at, updated_at)\n" +
                            "SELECT ?, id, NOW(), NOW()\n" +
                            "FROM users WHERE username in (?);"
        var values = [results.insertId, chatParticipantsArray];
        var query = db.build_query(query_string, values);

        db.connection.query(query, function (error, results, fields) {
          if (error) {
            return db.connection.rollback(function() {
              throw error;
            });
          }
          db.connection.commit(function(err) {
            if (err) {
              return db.connection.rollback(function() {
                console.log("Error creating chat participant for direct message");
                throw err;
              });
            }
            return callback(null, {direct_message_id: chat_id});
          });
        });
      });
    });
  }
  add_users_to_dm(users, direct_message_id, callback) {
    var userArray = Chat.get_user_array_from_string(users);
    var query_string = "INSERT INTO chat_participants (chat_id, user_id, created_at, updated_at)\n" +
                        "SELECT ?, id, NOW(), NOW()\n" +
                        "FROM users WHERE username in (?);"
    var values = [direct_message_id, userArray];
    var query = db.build_query(query_string, values);

    console.log(query);

    db.connection.query(query, (error, results, fields) => {
        if (error) {
            var err = new Error(error)
            err.code = http_codes.NOT_FOUND;
            return callback(err);
        } else {
            return callback(null, direct_message_id);
        }
    })
  }
  verify_direct_message(user_id, direct_message_id, callback) {
    var query_string = "SELECT id FROM chat_participants WHERE user_id = ? AND chat_id = ?"
    var values = [user_id, direct_message_id]
    var query = db.build_query(query_string, values);

    db.connection.query(query, (error, results, fields) => {
        if (error) {
            var err = new Error(error)
            err.code = http_codes.NOT_FOUND;
            return callback(err);
        } else if (results.length == 0) {
            return callback(null, false);
        } else {
            return callback(null, true);
        }
    })
  }
  static get_user_array_from_string(user_string) { return user_string.split(',').map(x => x.replace(' ', '')); } // split into an array on commas and strip whitespace
}

module.exports = Chat;