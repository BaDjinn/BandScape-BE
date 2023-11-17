const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const validateToken = express.Router();

validateToken.post("/validateToken", async (req, res) => {
  const token = req.body.token; // Assumendo che il token sia nel corpo della richiesta
  console.log("validateTokenPreso");
  try {
    // Verifica il token
    const decoded = jwt.verify(token, process.env.JWT_CODICESEGRETO);

    // Se la verifica è riuscita, il token è valido
    console.log("Token valido", decoded);
    res.status(200).send("Token valido");
  } catch (error) {
    // Se c'è un errore, il token non è valido
    console.error("Token non valido", error);
    res.status(401).send("Token non valido");
  }
});

module.exports = validateToken;
