const mongoose = require("mongoose");
const { Schema } = mongoose;

var UserSchema = new Schema({
  username: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String, require: true },
  gender: { type: Boolean, require: true },
  role: { type: String, require: true },
},{
  timestamps: true
});
module.exports = mongoose.model("User", UserSchema, "user");
