"use strict"
var Database = require('./database');
var db = new Database();
var http_codes = require('http-status-codes');
var session = require('client-sessions');
var hasher = require('password-hash-and-salt');

class Session {
    login(username, password, user_session, callback) {
        var query_string = "SELECT id, hashed_pw FROM users WHERE username = ?";
        var values = [username];
        var query = db.build_query(query_string, values);

        db.connection.query(query, (error, results, fields) => {
            if (error) {
                var error = new Error(error);
                error.code = http_codes.NOT_FOUND;
                return callback(error);
            }

            if (results.length) {
                var db_password = results[0].hashed_pw;
                var user_id = results[0].id;
                hasher(password).verifyAgainst(db_password, function(error, verified) {
                    if (error)
                        throw error; // need to make this fail gracefully
                    if (!verified) {
                        console.log("Invalid password.");
                        return callback(null, null);
                    } else {
                        console.log("Valid password.");
                        user_session.user = user_id;
                        console.log(user_session);
                        return callback(null, user_id);
                    }
                });
            } else {
                console.log("Invalid username.");
                return (callback(null, null));
            }
        });
    }
}

module.exports = Session;