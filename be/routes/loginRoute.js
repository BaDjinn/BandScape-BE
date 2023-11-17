const express = require("express");
const login = express.Router();

require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

login.post("/login", async (req, res) => {
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    res.status(404).send({
      statusCode: 404,
      message: "Utente non trovato",
    });
  }
  //confronto la pass del req con quella a dtyb entrambe decritpo
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    res.status(401).send({
      status: 401,
      message: "Password o login non valida",
    });
  }

  // creo il mio token
  //il primo parametro è quello che vogliamo criptare dentro il token
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_CODICESEGRETO, //codice segreto preso da var ambiente
    {
      expiresIn: "1h", //tempo di expires posso metterlo anche in millisec numerici
    }
  );

  res.header("Authorization", token).status(200).send({
    message: "Login effettuato con successo",
    token,
  });
});
