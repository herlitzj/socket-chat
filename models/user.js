"use strict"
var Database = require('./database');
var db = new Database();
var Session = require('./session');
var session = new Session();
var http_codes = require('http-status-codes');
var fs = require('fs');

var AWS = require('aws-sdk');
var aws_credentials = require('../rootkey.json');
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
                var avatar = "../public/img/user.png";
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