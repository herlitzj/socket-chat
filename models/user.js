"use strict"
var Database = require('./database');
var db = new Database();
var http_codes = require('http-status-codes');

class User {
    get(user_id, user_session, callback) {
        if (user_session.user != user_id) {
            return callback(null, null);
        }
        // Add database calls to get user
        var query_string = "SELECT * FROM users WHERE id = ?";
        var values = [user_id];
        var query = db.build_query(query_string, values);

        db.connection.query(query, (error, results, fields) => {
            if (error) {
                var error = new Error(error)
                error.code = http_codes.NOT_FOUND;
                return callback(error);
            } else {
                return callback(null, results);
            }
        });
    }
    create(user_info, callback) {
        user_info.created_at = Date();
        user_info.updated_at = user_info.created_at;
        var query_string = "INSERT INTO users (first_name, last_name, email, username, created_at, updated_at) VALUES(?, ?, ?, ?, NOW(), NOW())"
        var values = [user_info.first_name, user_info.last_name, user_info.email, user_info.username]
        var query = db.build_query(query_string, values);

        db.connection.query(query, (error, results, fields) => {
            if (e) {
                var error = new Error(error)
                error.code = http_codes.NOT_FOUND;
                return callback(error);
            } else {
                return callback(null, results);
            }
        })
    }
    update(user_info, callback) {

        var query_string = "UPDATE users SET first_name = ?, last_name = ?, email = ?, username = ?, updated_at = NOW() where id = ?";
        var values = [user_info.first_name, user_info.last_name, user_info.email, user_info.username, user_info.id];
        var query = db.build_query(query_string, values);

        db.connection.query(query, (error, results, fields) => {
            if (e) {
                var error = new Error(error)
                error.code = http_codes.NOT_FOUND;
                return callback(error);
            } else {
                return callback(null, results);
            }
        })
    }
}

module.exports = User;