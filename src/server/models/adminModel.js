const mongoose = require("mongoose");
const definitions = require("../../utility/definitions");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const Admin = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

Admin.pre("save", function(next) {
  let that = this;

  bcrypt.hash(that.password, saltRounds, function(err, hash) {
    // Store hash in your password DB.
    that.password = hash;
    console.log(that);
    next();
  });
});

module.exports = mongoose.model("Admin", Admin);
