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

        var return_object = {
            validated: false,
            message: "Invalid Username or Password"
        }

        db.connection.query(query, (db_error, results, fields) => {
            if (db_error) {
                var err = new Error(db_error);
                err.code = http_codes.INTERNAL_SERVER_ERROR;
                return callback(err);
            }

            if (results.length) {
                var db_password = results[0].hashed_pw;
                var user_id = results[0].id;
                this.validate_password(password, db_password, (val_error, is_valid) => {
                    if(val_error) {
                        var err = new Error(val_error);
                        err.code = http_codes.INTERNAL_SERVER_ERROR;
                        return callback(err);
                    } else {
                        if(is_valid) {
                            user_session.user = user_id;
                            return_object.message = "Validated";
                            return_object.validated = is_valid;
                        }
                        return callback(null, return_object);
                    }
                })
            } else {
                console.log(return_object);
                return (callback(null, return_object));
            }
        });
    }
    hash_password(password, callback) {
        hasher(password).hash(function(error, hash) {
            error ? callback(error) : callback(null, hash);
        })
    }
    validate_password(password, hash, callback) {
        hasher(password).verifyAgainst(hash, function(error, verified) {
            error ? callback(error) : callback(null, verified);
        })
    }
}

module.exports = Session;






