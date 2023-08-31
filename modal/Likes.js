const mongoose = require("mongoose");
const { Schema } = mongoose;

var LikeSchema = new Schema({
  isLike: { type: Boolean, require: true },
  author: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  post: { type: mongoose.SchemaTypes.ObjectId, ref: "Post" },
});
module.exports = mongoose.model("Likes", LikeSchema, "likes");
