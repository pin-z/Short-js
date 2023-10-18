const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
//creating a schema for storing collected data in database.
const Person = new mongoose.Schema({
    Name: {type: String, required: true},
    email: {type: String, required: true},
    age: {type: Number},
    password: {type: String, required: true}
  
  });

  // I am using bcrypt, but you need your comparer function
  Person.methods.verifyPassword = function (password, callback) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
      if (err) {
        return callback(err);
      }
      callback(null, isMatch);
    });
  };

  
  
  //defining model for Person schema
  const User = mongoose.model('User', Person);
  exports.User = User;

  