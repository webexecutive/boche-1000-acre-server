const express = require("express");
const router = express.Router();
const { submitForm, submitContactForm } = require("../controllers/clientController");

router.post('/submit', submitForm);
router.post('/contact', submitContactForm);

module.exports = router;