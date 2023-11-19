//header
//librerie
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

//variabili d'ambiente
const PORT = process.env.REACT_APP_SERVERPORT;

// Aggiungo le rotte
//const userRoute = require("./routes/userRoute");
const commentRoutes = require("./routes/commentRoutes");
const loginRoutes = require("./routes/loginRoute");
const postRoute = require("./routes/postRoute");
const userRoute = require("./routes/userRoute");
const verifyTokenRoute = require("./routes/verifyRoute");

//Importo eventuali middlewares
//const logger = require("../middlewares/logger");
const validatePost = require("./middlewares/validatePost");

//inizializzo app/express
const app = express();
//app.use per i middleware
app.use(express.json());
app.use(cors());

//app.use per le routes
/*app.use("/", userRoute);*/
app.use("/", commentRoutes);
app.use("/", loginRoutes);
app.use("/", postRoute);
app.use("/", userRoute);
app.use("/", verifyTokenRoute);

//creo la risposta per la root principale
app.get("/", (req, res) => {
	res.send({
		//dati della risposta sulla get principale
	});
});

//inizializzo sul serio mongoose
mongoose.connect(process.env.REACT_APP_MONGOOSESERVERCONNECTION, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

//lancio la connessione con il db di moongoose
const db = mongoose.connection;
// db.on  vuol dire, ogni volta che
db.on("error", console.error.bind(console, `!!!Error during DB connec--!!!`));
// db.once vuol dire, una volta che
db.once("open", () => {
	const now = new Date();
	console.log(`Database suxex and connected now: ${now}`);
});

//metto l'app in ascolto sulla porta che ho stabilito in ".env"
app.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));

console.log("Got ya!");
