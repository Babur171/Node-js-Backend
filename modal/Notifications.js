const mongoose = require("mongoose");
const { Schema } = mongoose;

var NotificationSchema = new Schema({
  title: { type: String, require: true },
  content: { type: String, require: true },
  is_read: { type: Boolean, require: true },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
});
module.exports = mongoose.model(
  "Notification",
  NotificationSchema,
  "notification"
);
