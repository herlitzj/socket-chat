"use strict"
var mysql = require('mysql');

const DATABASE_INFO = {
    host: 'cs361.cdm64kabqtwv.us-west-2.rds.amazonaws.com',
    user: 'wcamiller',
    password: 'cs361projectb',
    database: 'eridanus'
};

class Database {
  constructor() {
  	this.connection = mysql.createConnection(DATABASE_INFO)
  }
  build_query(query_string, values) {
  	return mysql.format(query_string, values);
  }
  copy_table(table_name, callback) {
    var test_table_name = "TEST_" + table_name;
    var query_string = "CREATE TABLE ?? LIKE ??"
    var values = [test_table_name, table_name]
    var query = this.build_query(query_string, values);

    return this.connection.query(query, (error, results, fields) => {
        if (error) {
            var error = new Error(error)
            error.code = http_codes.NOT_FOUND;
            return callback(error);
        } else {
            return callback(null, true);
        }
    })
  }
  delete_table(table_name, callback) {
    var query_string = "DROP TABLE ??"
    var values = [table_name]
    var query = this.build_query(query_string, values);

    return this.connection.query(query, (error, results, fields) => {
        if (error) {
            var error = new Error(error)
            error.code = http_codes.NOT_FOUND;
            return callback(error);
        } else {
            return callback(null, true);
        }
    })
  }
}

module.exports = Database;