"use strict"
var Database = require('./database');
var db = new Database();
var Session = require('./session');
var session = new Session();
var http_codes = require('http-status-codes');
var fs = require('fs');

var AWS = require('aws-sdk');
const AWSAccessKeyId = process.env.AWS_KEYID;
const AWSSecretKey = process.env.AWS_SECRETKEY;

AWS.config.update({
    accessKeyId: AWSAccessKeyId,
    secretAccessKey: AWSSecretKey,
    region: 'us-west-2'
});


var lambda = new AWS.Lambda();


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
            if (hash_error) {
                var err = new Error(hash_error);
                err.code = http_codes.INTERNAL_SERVER_ERROR;
                return callback(err);
            } else {
                var avatar = "data:image/png;base64,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";
                var query_string = "INSERT INTO users (first_name, last_name, email, username, created_at, updated_at, timezone, avatar, hashed_pw) VALUES(?, ?, ?, ?, NOW(), NOW(), ?, ?, ?)"
                var values = [user_info.first_name, user_info.last_name, user_info.email, user_info.username, null, avatar, hashed_pw]
                var query = db.build_query(query_string, values);

                db.connection.query(query, (error, results, fields) => {
                    if (error) {
                        var error = new Error(error)
                        error.code = http_codes.NOT_FOUND;
                        return callback(error);
                    } else {
                        user_session.user = results.insertId;
                        user_session.username = user_info.username;
                        user_session.email = user_info.email;
                        user_session.avatar = avatar;
                        return callback(null, results);
                    }
                })
            }
        }

        return session.hash_password(user_info.password, create_user);
    }

    // update(user_info, callback) {

    // }

    update(user_info, callback) {

        var iterate_values = function(user_info) {
            var values = [];
            var query_obj = {};
            var query_string = "UPDATE users SET ";

            for (var val in user_info) {
                if (user_info[val].length && val !== "id" && val !== "avatar_img" && val !== "timezone" && val !== "password") {
                    // remove inappropriate field names on frontend via jquery
                    query_string += val + " = ? , ";
                    values.push(user_info[val]);
                }
            }

            query_string += "updated_at = NOW()";
            query_string += " WHERE id = ?";
            values.push(user_info["id"]);
            query_obj["query_string"] = query_string;
            query_obj["values"] = values;

            db.connection.query(query_obj["query_string"], query_obj["values"], (error, results, fields) => {
                if (error) {
                    var err = new Error(error)
                    err.code = http_codes.NOT_FOUND;
                    return callback(err);
                } else {
                    return callback(null, results);
                }
            });
        };

        User.resize_image(user_info, iterate_values);
    }

    static resize_image(user_info, callback) {
        if (user_info["avatar"]) {
            var img = user_info["avatar"];
            var lambda_params = {
                FunctionName: 'imagemagick',
                Payload: JSON.stringify({
                    "operation": 'resize',
                    "base64Image": img.split(',')[1]
                })
            };
            var img_header = img.split(',')[0];

            lambda.invoke(lambda_params, function(err, data) {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    var img_str = img_header + "," + JSON.parse(data.Payload);
                    user_info["avatar"] = img_str;
                    callback(user_info);
                }
            });
        } else {
            callback(user_info);
        }
    }
}

module.exports = User;