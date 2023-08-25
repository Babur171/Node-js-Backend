const mongoose = require("mongoose");
const { Schema } = mongoose;

var PostSchema = new Schema({
  content: { type: String, require: true },
  title: { type: String, require: true },
  image: { type: String, require: true },
  author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  comments: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Comment" }],
  likes: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Likes" }],
});
module.exports = mongoose.model("Post", PostSchema, "post");
