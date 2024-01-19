const mongoose = require("mongoose");
const { Schema } = mongoose;

const sequenceSchema = new Schema({
  _id: { type: String, default: "roleSeq" },
  seq: { type: Number, default: 700 }
});

const Sequence = mongoose.model("Sequence", sequenceSchema);

Sequence.findOneAndUpdate(
  { _id: "roleSeq" },
  { $setOnInsert: { seq: 700 } },
  { new: true, upsert: true }
)
  .then((doc) => {
  })
  .catch((err) => {
    console.error("Error initializing sequence:", err);
  });

const RolesSchema = new Schema({
  _id: Number,
  name: { type: String, required: true }
});

// Pre-save middleware to generate the _id value
RolesSchema.pre("save", async function (next) {
  if (!this._id) {
    const sequenceDoc = await Sequence.findOneAndUpdate(
      { _id: "roleSeq" },
      { $inc: { seq: 1 } },
      { new: true }
    );
    this._id = sequenceDoc.seq;
  }
  next();
});

// Convert the schema to a model
const Roles = mongoose.model("Roles", RolesSchema, "roles");

// Export the model
module.exports = Roles;
