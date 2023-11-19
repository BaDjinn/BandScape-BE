//importo i metodi di express
const express = require("express");
//creo il router degli utenti / user
const user = express.Router();
//creo il modello dentro la cartella ./models = altro non è che uno schema di creazione della tabella utenti
//vedi la cartella models e poi torna qua
const userModel = require("../models/userModel");

//importo la lib di cript
const bcrypt = require("bcrypt");
//jwt
const jwt = require("jsonwebtoken");

//Importo eventuali middlewares
//vedi i file dentro la cartella middelwares per saperne di più

// creo la GET
// nota, ho messo il middlewares "logger(req)" prima della risposta vera è propria
user.get("/users", async (req, res) => {
	try {
		// UserModel.find è un metodo di mongoose, vedi documentazione mongoose
		// in questo caso, guarda il modello degli utenti
		// fa una get su tutto quello che trova nella tabella che hai indicato nel model
		// ti restituisce un oggetto
		const user = await userModel.find();
		res.status(200).send({
			statusCode: 200,
			user,
		});
	} catch (error) {
		res.status(500).send({
			statusCode: 500,
			message: `Internal GET error`,
			error: error,
		});
	}
});

// creo la post
// user.post è un metodo di express.Router, si scrive proprio così
// alla peggio dai un occhio alla documentazione

user.get("/user/extAccess/:externalID", async (req, res) => {
	const { externalID } = req.params;

	const user = await userModel.findOne({ externalID: externalID });
	if (user) {
		const token = jwt.sign(
			{
				id: user._id,
				nick: user.nick,
				email: user.email,
				isAdmin: user.isAdmin,
				usrImg: user.usrImg,
				usrBio: user.usrBio,
			},
			process.env.JWT_CODICESEGRETO //codice segreto preso da var ambiente
		);
		return res.status(200).send({
			statusCode: 200,
			token: token,
		});
	} else {
		return res.status(401).send({
			statusCode: 401,
			message: "Utente non trovato",
		});
	}
});

user.post("/users/login", async (req, res) => {
	// devo inserire il check con l'externalID
	try {
		const { email, password } = req.body;
		console.log(password);
		const user = await userModel.findOne({ email: email }).exec();
		const comp = bcrypt.compare(password, user.password).then((result) => {
			console.log(result);

			const token = jwt.sign(
				{
					id: user._id,
					nick: user.nick,
					email: user.email,
					isAdmin: user.isAdmin,
					usrImg: user.usrImg,
					usrBio: user.usrBio,
				},
				process.env.JWT_CODICESEGRETO //codice segreto preso da var ambiente
			);

			if (result) {
				res.status(200).send({
					statusCode: 200,
					comp: comp,
					payload: user,
					token: token,
				});
			} else {
				res.status(200).send({
					statusCode: 200,
					comp: comp,
					payload: false,
				});
			}
		});
	} catch (error) {
		res.status(200).send({
			statusCode: 200,
			payload: false,
		});
	}
});

user.post("/users/create", async (req, res) => {
	//qua devo criptare la passw
	//complessità crypt 10 TOP

	const verificaUtente = await userModel.findOne({ email: req.body.email });
	if (verificaUtente) {
		return res.status(401).send({
			statusCode: 401,
			message: `Utente con la stessa mail già presente`,
			userCheck: false,
		});
	}
	const passwordDiPartenza = req.body.password;
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(passwordDiPartenza, salt);

	// creo l'oggetto user partendo da quello che vedo nella req
	let userData = {
		nick: req.body.nick,
		email: req.body.email,
		isAdmin: req.body.isAdmin,
		password: hashedPassword,
		usrImg: req.body.usrImg,
		usrBio: req.body.usrBio,
	};

	if (req.body.usrImg) {
		userData = { ...userData, usrImg: req.body.usrImg };
	}
	if (req.body.externalID) {
		userData = { ...userData, externalID: req.body.externalID };
	}

	console.log(userData);
	const newUser = new userModel(userData);
	console.log(newUser);
	try {
		// ora mando i dati al database

		const user = await newUser.save();
		const token = jwt.sign(
			{
				id: user._id,
				nick: user.nick,
				email: user.email,
				isAdmin: user.isAdmin,
				usrImg: user.usrImg,
				usrBio: user.usrBio,
			},
			process.env.JWT_CODICESEGRETO //codice segreto preso da var ambiente
		);
		res.status(200).send({
			statusCode: 200,
			token: token,
			message: `Utente ${newUser.name} creato correttamente`,
			payload: newUser,
		});
	} catch (error) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno",
			error: error,
		});
	}
});

// creo la put per modificare i dati
user.patch("/users/update/:userID", async (req, res) => {
	//destrutturo l'url per estrarre l'id
	const { userID } = req.params;
	//verifico che esista l'id
	try {
		const dataToUpdate = req.body;
		const userExist = await userModel.findByIdAndUpdate(userID, dataToUpdate, {
			new: true,
		});
		if (!userExist) {
			return res.status(404).send({
				statuscode: 404,
				message: `L'utente con id ${userID} non esiste`,
			});
		}
		const token = jwt.sign(
			{
				id: userExist._id,
				nick: userExist.nick,
				email: userExist.email,
				isAdmin: userExist.isAdmin,
				usrImg: userExist.usrImg,
				usrBio: userExist.usrBio,
			},
			process.env.JWT_CODICESEGRETO //codice segreto preso da var ambiente
		);
		return res.status(200).send({
			statuscode: 200,
			message: `I dati sono stati aggiornati`,
			token: token,
		});
	} catch (error) {
		res.status(500).send({
			statusCode: 500,
			message: `Non sono riuscito ad aggiornare l'utente con id ${userID} non esiste`,
			error: error,
		});
	}
});

user.delete("/users/delete/:userID", async (req, res) => {
	const { userID } = req.params;
	try {
		const delUser = await userModel.findByIdAndDelete(userID);
		if (!delUser) {
			return res.status(404).send({
				statusCode: 404,
				message: "Post not found or already deleted!",
			});
		}
		res.status(200).send({
			statusCode: 200,
			message: "Post deleted suxxesfully",
		});
	} catch (error) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

module.exports = user;
