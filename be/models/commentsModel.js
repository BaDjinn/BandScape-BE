const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
	postFather: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "postModel",
		type: String,
		required: true,
	},
	commentFather: {
		type: String,
		required: false,
	},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "userModel",
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("commentModel", CommentSchema, "comment");
