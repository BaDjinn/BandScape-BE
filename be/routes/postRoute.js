const express = require("express");
const PostModel = require("../models/postModel");

const validatePost = require("../middlewares/validatePost");

const posts = express.Router();

//dentro questo model parliamo anche di caricamento immagini
//devo importare multer per l'upload immagine
const multer = require("multer");

//importo cloudinay per l'upload in cloud
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

//configuro cloudinary con i dati che ho caricato nell'env
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

//definisco i parametri del cloudstorage
//la folder nei params viene creata al momento della post se non c'è
const cloudStorage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "postsImage",
		format: async (req, file) => "png",
		public_id: (req, file) => file.name,
	},
});

// creo il cloudUpload che quando verrà chiamato saprà di dover caricare i dati su cloudinary
const cloudUpload = multer({ storage: cloudStorage });

//creo la dir che farà l'upload del file una
posts.post(
	"/posts/cloudUpload",
	cloudUpload.single("cover"),
	async (req, res) => {
		try {
			res.status(200).json({
				statusCode: 200,
				cover: req.file.path,
			});
		} catch (error) {
			res.status(500).send({
				statusCode: 500,
				message: `Upload a cloudStorage fallito`,
				error: error,
			});
		}
	}
);

//caricamento immagini con loacalstorage
//importo la const per crittografare mettere del testo randomico nelle img che devono avere nome univoco
const crypto = require("crypto");

//definisco i parametri per l'eventuale localstorage
const internalStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		// posizione in cui salvare i file
		cb(null, "./public/img");
	},
	filename: (req, file, cb) => {
		// generiamo un suffisso unico per il nostro file
		const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
		// qui ci recuperiamo da tutto solo l'estensione dello stesso file
		const fileExtension = file.originalname.split(".").pop();
		// eseguiamo la cb con il titolo completo
		cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExtension}`);
	},
});

//creo la funzione multer per fare il local storage
const upload = multer({ Storage: internalStorage });

//creo la chiamata che salva i dati in local storage
posts.post(
	"/posts/uploadLocalImg",
	upload.single("cover"),
	async (req, res) => {
		const url = `${req.protocol}://${req.get("host")}`; // http://localhost:5050 questo per ottenere il nome del server attuale

		console.log(req.file);

		try {
			const imgUrl = req.file.filename;
			res.status(200).json({ cover: `${url}/public/${imgUrl}` });
		} catch (e) {
			res.status(500).send({
				statusCode: 500,
				message: "Errore interno del server",
			});
		}
	}
);

//chiamate per l'upload dei singoli post
//la get conterrà anche i dati per il pagination
//i eventuali dati per il pagination potrai anche passarglieli tu lato frontend
//page e pageSize al momento settano un Default
//ma se glieli passi da frontend come params hai risolto
posts.get("/posts", async (req, res) => {
	const { page = 1, pageSize = 3 } = req.query;
	try {
		const posts = await PostModel.find()
			.populate("author")
			.limit(pageSize)
			.skip((page - 1) * pageSize);

		const totalPosts = await PostModel.count();

		res.status(200).send({
			statusCode: 200,
			currentPage: Number(page),
			totalPages: Math.ceil(totalPosts / pageSize),
			totalPosts,
			posts,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

//get single post
posts.get("post/:postID", async (req, res) => {
	const { postID } = req.params;
	try {
		const postByID = await PostModel.findById(postID).populate("author");
		if (!postByID) {
			return res.status(404).send({
				statusCode: 404,
				message: "post not found",
			});
		}
		console.log(postByID);
		res.status(200).send({
			statusCode: 200,
			postByID,
		});
	} catch (error) {
		res.status(400).send({
			status: 400,
			error: error,
		});
	}
});

//faccio la get per titolo con la query
//chiaramente devi chiamare questa route per fare il "filtro" per titolo
//lato frontend scriverò una cosa del genere  `http://localhost:5050/posts/bytitle?title=nomedeltitolo`
posts.get("/posts/bytitle", async (req, res) => {
	const { title } = req.query;
	try {
		const postByTitle = await PostModel.find({
			title: {
				$regex: title,
				$options: "i",
			},
		});

		res.status(200).send(postByTitle);
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

//lato frontend scriverò una cosa del genere  `http://localhost:5050/posts/bydate?date=nomedeltitolo`
/*posts.get("/posts/bydate/:date", async (req, res) => {
	const { date } = req.params;

	try {
		const getPostByDate = await PostModel.aggregate([
			{
				$match: {
					$expr: {
						$and: [
							{
								$eq: [
									{ $dayOfMonth: "$createdAt" },
									{ $dayOfMonth: new Date(date) },
								],
							},
							{
								$eq: [{ $month: "$createdAt" }, { $month: new Date(date) }],
							},
							{
								$eq: [{ $year: "$createdAt" }, { $year: new Date(date) }],
							},
						],
					},
				},
			},
		]);

		res.status(200).send(getPostByDate);
	} catch (e) {}
});

posts.get("/posts/byid/:id", async (req, res) => {
	const { id } = req.params;

	try {
		const post = await PostModel.findById(id).populate(
			"author",
			"_id name usrImg"
		);
		if (!post) {
			return res.status(404).send({
				statusCode: 404,
				message: "post not found",
			});
		}

		res.status(200).send({
			statusCode: 200,
			post,
		});
	} catch (e) {}
});*/

//creazione del Post
posts.post("/posts/create", validatePost, async (req, res) => {
	const newPost = new PostModel({
		title: req.body.title,
		cover: req.body.cover,
		author: req.body.author,
		content: req.body.content,
	});

	try {
		const post = await newPost.save();
		//implement same-title-stop
		res.status(201).send({
			statusCode: 201,
			message: "Post saved successfully",
			payload: post,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
			error: e,
		});
	}
});

posts.patch("/posts/update/:postId", async (req, res) => {
	const { postId } = req.params;

	try {
		const dataToUpdate = req.body;
		const options = { new: true };
		const result = await PostModel.findByIdAndUpdate(
			postId,
			dataToUpdate,
			options
		);
		if (!result) {
			return res.status(404).send({
				statusCode: 404,
				message: "This post does not exist!",
			});
		}

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
});

posts.delete("/posts/delete/:postId", async (req, res) => {
	const { postId } = req.params;

	try {
		const post = await PostModel.findByIdAndDelete(postId);
		if (!post) {
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

posts.get("/post/byAuthor/:authorID", async (req, res) => {
	const { authorID } = req.params;
	try {
		const posts = await PostModel.find({ author: authorID }).populate(
			"author",
			"_id name usrImg"
		);
		res.status(200).send({
			statusCode: 200,
			message: `Trovati tutti i post per l'utente con id ${authorID}`,
			payload: posts,
		});
	} catch (error) {
		res.status(400).send({
			statusCode: 400,
			message: `Non hai ancora nessun post`,
		});
	}
});

module.exports = posts;
