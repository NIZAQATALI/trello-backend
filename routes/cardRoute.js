const cardController = require('../Controllers/cardController');
const express = require('express');
const router = express.Router();
const auth = require("../Middlewares/auth");
router.post('/create',  auth.verifyToken, cardController.create);
router.get('/:boardId/:listId/:cardId',  auth.verifyToken, cardController.getCard);
router.put('/:boardId/:listId/:cardId',  auth.verifyToken,  cardController.update);
module.exports = router;