const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},

		cover: {
			type: String,
			required: true,
			default:
				"https://static.vecteezy.com/ti/vettori-gratis/p1/2318271-icona-profilo-utente-vettoriale.jpg",
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
	},
	{ timestamp: true, strict: true }
);

module.exports = mongoose.model("postModel", PostSchema, "posts");
