const mongoose = require("mongoose");
const { Schema } = mongoose;

var Taskschema = new Schema({
  summary: { type: String, require: true },
  descriptions: { type: String, require: true },
  due_date: { type: Date, require: true },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  is_completed: { type: Boolean },
});
module.exports = mongoose.model("Tasks", Taskschema, "tasks");
