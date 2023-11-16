//importo i metodi di mongoose
const mongoose = require("mongoose");
const UsersSchema = new mongoose.Schema(
	{
		nick: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			lowercase: true,
			unique: true,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please fill a valid email address",
			],
		},

		isAdmin: {
			type: Boolean,
			required: false,
			default: false,
		},

		password: {
			type: String,
			required: true,
			unique: false,
			match: [
				/^(?=.*[A-ZÀ-ÖØ-Þ])(?=.*[a-zà-öø-ÿ])(?=.*\d)(?=.*[@#$%^&+=!]).{8,24}$/,
				"Password must be longer than 8 characters, and contain at least one Capital letter, one number and one special symbol.",
			],
		},

		usrImg: {
			type: String,
			required: false,
			default:
				"https://static.vecteezy.com/ti/vettori-gratis/p1/2318271-icona-profilo-utente-vettoriale.jpg",
		},
	},
	//gli metto le options roba da guardare in documentazione
	{
		// si fa il timestamp di quando lo crei
		timestamps: true,
		//se il tipo di dati differisce da quello che gli ho detto si incazza
		strict: true,
	}
);

//sporto lo schema
module.exports = mongoose.model(
	// il nome del modello a piacere basta che te lo ricordi in futuro
	"userModel",
	// la variabile creata sopra
	UsersSchema,
	// il nome della "tabella" di mongoose, non ti preoccupare se non l'hai creata
	// non devi crearla fa tutto lui
	"users"
);

//dopo aver fatto tutto questo torna sulla route userRoute.js
