const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
    required: true,
    max: 500,
  },
  title: {
    type: String,
    required: true,
    max: 100,
  },
  likes: {
    type: Array,
    default: [],
  },
  unlikes: {
    type: Array,
    default: [],
  },
  comments: {
    type: Array,
    default: [],
  },
  uploadedDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", PostSchema);
