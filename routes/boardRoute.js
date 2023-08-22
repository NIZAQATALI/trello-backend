const express = require('express');
const boardController = require('../Controllers/boardController');
const route = express.Router();
const auth = require("../Middlewares/auth");
route.post('/:boardId/add-member',auth.verifyToken, boardController.addMember);
route.put('/:boardId/update-background', auth.verifyToken, boardController.updateBackground);
route.put('/:boardId/update-board-description',  auth.verifyToken,boardController.updateBoardDescription);
route.put('/:boardId/update-board-title',auth.verifyToken, boardController.updateBoardTitle);
route.post('/create',auth.verifyToken, boardController.create);
route.get('/:id', auth.verifyToken, boardController.getById);
route.delete('/:boardId',auth.verifyToken, boardController.deleteById);
route.get('/:id/activity', auth.verifyToken, boardController.getActivityById);
route.get('/',  auth.verifyToken, boardController.getAll);

module.exports = route;
