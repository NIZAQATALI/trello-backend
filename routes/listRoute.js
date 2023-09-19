const express = require('express');
const router = express.Router();
const auth = require("../Middlewares/auth");
const listController = require('../Controllers/listController');
router.put('/:workspaceId/:boardId/:listId/update-title', auth.verifyToken, listController.updateListTitle);
router.post('/:workspaceId/create', auth.verifyToken, listController.create);
router.get('/:workspaceId/:boardId',  auth.verifyToken, listController.getAll);
router.delete('/:workspaceId/:boardId/:listId',    auth.verifyToken, listController.deleteById);
router.post('/change-card-order',   auth.verifyToken, listController.updateCardOrder);
router.post('/change-list-order',   auth.verifyToken, listController.updateListOrder);
router.post('/:workspaceId/:boardId/:listId/add-member',auth.verifyToken, listController.addMemberToList);
router.delete('/:workspaceId/:boardId/:listId/delete-member-from-list',auth.verifyToken, listController.deleteMemberFromList);
module.exports = router;
