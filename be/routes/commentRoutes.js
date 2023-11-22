const express = require("express");
const commentModel = require("../models/commentsModel");

//const validatePost = require("../middlewares/validatePost");

const comment = express.Router();

//faccio la get per titolo con la query
//chiaramente devi chiamare questa route per fare il "filtro" per titolo
//lato frontend scriverò una cosa del genere  `http://localhost:5050/comment?=`
comment.get("/comment/:articleID", async (req, res) => {
	const { articleID } = req.params;

	try {
		const comment = await commentModel
			.find({
				postFather: articleID,
			})
			.populate("author");

		res.status(200).send({
			statusCode: 200,
			comment,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

//creazione del Post
comment.post("/comment", async (req, res) => {
	const newComment = new commentModel({
		author: req.body.author,
		postFather: req.body.postFather,
		content: req.body.content,
	});

	try {
		const comment = await newComment.save();
		res.status(201).send({
			statusCode: 201,
			message: "Comment saved successfully",
			payload: comment,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
			error: e,
		});
	}
});

comment.patch("/comment/:commentId", async (req, res) => {
	const { commentId } = req.params;

	const postExist = await PostModel.findById(postId);

	if (!postExist) {
		return res.status(404).send({
			statusCode: 404,
			message: "This post does not exist!",
		});
	}
	const verifyAuthor = postExist.author === req.body.authorID;
	if (verifyAuthor) {
		try {
			const dataToUpdate = req.body;
			const options = { new: true };
			const result = await PostModel.findByIdAndUpdate(
				commentId,
				dataToUpdate,
				options
			);

			res.status(200).send({
				statusCode: 200,
				message: "Post edited successfully",
				result,
			});
		} catch (e) {
			res.status(500).send({
				statusCode: 500,
				message: "Errore interno del server",
			});
		}
	} else {
		res.status(500).send({
			statusCode: 500,
			message: "L'autore non è corretto",
		});
	}
});

comment.delete("/comment/:commentID", async (req, res) => {
	const { commentID } = req.params;

	try {
		const comment = await commentModel.findByIdAndDelete(commentID);
		if (!comment) {
			return res.status(404).send({
				statusCode: 404,
				message: "Post not found or already deleted!",
			});
		}
		res.status(200).send({
			statusCode: 200,
			message: "Post deleted successfully",
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

module.exports = comment;
