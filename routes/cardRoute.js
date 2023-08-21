const cardController = require('../Controllers/cardController');
const express = require('express');
const router = express.Router();
const auth = require("../Middlewares/auth");


router.post('/create',  auth.verifyToken, cardController.create);
module.exports = router;