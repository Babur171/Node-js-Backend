const mongoose = require("mongoose");
const { Schema } = mongoose;

var PostSchema = new Schema({
  content: { type: String, require: true },
  title: { type: String, require: true },
  author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
});
module.exports = mongoose.model("Post", PostSchema, "post");
