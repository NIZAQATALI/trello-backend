const express = require('express');
const router = express.Router();
const auth = require("../Middlewares/auth");
const listController = require('../Controllers/listController');
router.put('/:boardId/:listId/update-title', auth.verifyToken, listController.updateListTitle);
router.post('/:workspaceId/create', auth.verifyToken, listController.create);
router.get('/:workspaceId/:boardId',  auth.verifyToken, listController.getAll);
router.delete('/:boardId/:listId',    auth.verifyToken, listController.deleteById);
router.post('/change-card-order',   auth.verifyToken, listController.updateCardOrder);
router.post('/change-list-order',   auth.verifyToken, listController.updateListOrder);
module.exports = router;
