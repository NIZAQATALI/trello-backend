const express = require('express');
const boardController = require('../Controllers/boardController');
const route = express.Router();
const auth = require("../Middlewares/auth");

route.post('/:boardId/add-member', boardController.addMember);
route.put('/:boardId/update-background', boardController.updateBackground);
route.put('/:boardId/update-board-description', boardController.updateBoardDescription);
route.put('/:boardId/update-board-title', boardController.updateBoardTitle);
route.post('/create',auth.verifyToken, boardController.create);
route.get('/:id', boardController.getById);
route.get('/:id/activity', auth.verifyToken, boardController.getActivityById);
route.get('/',  auth.verifyToken, boardController.getAll);

module.exports = route;
