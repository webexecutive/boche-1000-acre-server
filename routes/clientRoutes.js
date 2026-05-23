const express = require("express");
const router = express.Router();
const { submitForm, submitContactForm,submitSubscriber } = require("../controllers/clientController");

router.post('/submit', submitForm);
router.post('/contact', submitContactForm);
router.post('/subscribe',submitSubscriber);

module.exports = router;