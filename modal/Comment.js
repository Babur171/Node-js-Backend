const mongoose = require("mongoose");
const { Schema } = mongoose;

var CommentSchema = new Schema({
  content: { type: String, require: true },
  author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  post: { type: mongoose.SchemaTypes.ObjectId, ref: "Post" },
});
module.exports = mongoose.model("Comment", CommentSchema, "comment");
