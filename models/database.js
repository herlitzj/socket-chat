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
}

module.exports = Database;