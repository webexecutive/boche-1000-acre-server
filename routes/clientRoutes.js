const express = require("express");
const router = express.Router();
const { submitForm } = require("../controllers/clientController");

router.post('/submit', submitForm);

module.exports = router;