"use strict"
var Database = require('./database');
var db = new Database();
var Session = require('./session');
var session = new Session();
var http_codes = require('http-status-codes');

class User {
    get(user_id, user_session, callback) {
        console.log(user_session);
        if (user_session.user != user_id) {
            return callback(null, null);
        }
        // Add database calls to get user
        var query_string = "SELECT * FROM users WHERE id = ?";
        var values = [user_id];
        var query = db.build_query(query_string, values);

        db.connection.query(query, (error, results, fields) => {
            if (error) {
                var err = new Error(error)
                err.code = http_codes.NOT_FOUND;
                return callback(err);
            } else {
                return callback(null, results);
            }
        });
    }
    create(user_info, user_session, callback) {

      var create_user = function(hash_error, hashed_pw) {
        if(hash_error) {
          var err = new Error(hash_error);
          err.code = http_codes.INTERNAL_SERVER_ERROR;
          return callback(err);
        } else {
          user_info.created_at = Date();
          user_info.updated_at = user_info.created_at;
          var query_string = "INSERT INTO users (first_name, last_name, email, username, created_at, updated_at, timezone, hashed_pw) VALUES(?, ?, ?, ?, NOW(), NOW(), ?, ?)"
          var values = [user_info.first_name, user_info.last_name, user_info.email, user_info.username, null, hashed_pw]
          var query = db.build_query(query_string, values);

          db.connection.query(query, (error, results, fields) => {
              if (error) {
                  var error = new Error(error)
                  error.code = http_codes.NOT_FOUND;
                  return callback(error);
              } else {
                  user_session.user = results.insertId;
                  return callback(null, results);
              }
          })
        }
      }

      return session.hash_password(user_info.password, create_user);
    }
    update(user_info, callback) {

        var query_string = "UPDATE users SET first_name = ?, last_name = ?, email = ?, username = ?, updated_at = NOW() where id = ?";
        var values = [user_info.first_name, user_info.last_name, user_info.email, user_info.username, user_info.id];
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
}

module.exports = User;