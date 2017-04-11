"use strict"

class User {
  get(user_id) {
  	// Add database calls to get user
  	console.log("Got user...");
  }
  create(user_info) {
  	// Add database calls to create user
    console.log("Created user...");
    console.log(user_info);
  }
  update(user_info) {
  	// Add database calls to update user
  	console.log("Updated user...");
  }
}

module.exports = User;