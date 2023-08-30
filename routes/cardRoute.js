const cardController = require('../Controllers/cardController');
const express = require('express');
const router = express.Router();
const auth = require("../Middlewares/auth");
router.delete('/:boardId/:listId/:cardId/delete-card',   auth.verifyToken,cardController.deleteById);
router.put('/:boardId/:listId/:cardId/update-cover',  auth.verifyToken, cardController.updateCover);
router.put('/:boardId/:listId/:cardId/:attachmentId/update-attachment',   auth.verifyToken,cardController.updateAttachment);
router.delete('/:boardId/:listId/:cardId/:attachmentId/delete-attachment',  auth.verifyToken, cardController.deleteAttachment);
router.post('/:boardId/:listId/:cardId/add-attachment',  auth.verifyToken, cardController.addAttachment);
router.put('/:boardId/:listId/:cardId/update-dates',   auth.verifyToken,cardController.updateStartDueDates);
router.put('/:boardId/:listId/:cardId/update-date-completed',  auth.verifyToken, cardController.updateDateCompleted);
router.delete('/:boardId/:listId/:cardId/:checklistId/:checklistItemId/delete-checklist-item',   auth.verifyToken,cardController.deleteChecklistItem);
router.put('/:boardId/:listId/:cardId/:checklistId/:checklistItemId/set-checklist-item-text',  auth.verifyToken, cardController.setChecklistItemText);
router.put('/:boardId/:listId/:cardId/:checklistId/:checklistItemId/set-checklist-item-completed',  auth.verifyToken, cardController.setChecklistItemCompleted);
router.post('/:boardId/:listId/:cardId/:checklistId/add-checklist-item',  auth.verifyToken, cardController.addChecklistItem);
router.delete('/:workspaceId/:boardId/:listId/:cardId/:checklistId/delete-checklist',   auth.verifyToken,cardController.deleteChecklist);
router.post('/:workspaceId/:boardId/:listId/:cardId/create-checklist',   auth.verifyToken,cardController.createChecklist);
router.put('/:workspaceId/:boardId/:listId/:cardId/:labelId/update-label-selection',  auth.verifyToken, cardController.updateLabelSelection);
router.delete('/:workspaceId/:boardId/:listId/:cardId/:labelId/delete-label',  auth.verifyToken, cardController.deleteLabel);
router.put('/:workspaceId/:boardId/:listId/:cardId/:labelId/update-label',   auth.verifyToken,cardController.updateLabel);
router.post('/:workspaceId/:boardId/:listId/:cardId/create-label',  auth.verifyToken, cardController.createLabel);
router.post('/:workspaceId/:boardId/:listId/:cardId/add-member',  auth.verifyToken, cardController.addMember);
router.delete('/:workspaceId/:boardId/:listId/:cardId/:memberId/delete-member',   auth.verifyToken,cardController.deleteMember);
router.post('/create',  auth.verifyToken, cardController.create);
router.get('/:workspaceId/:boardId/:listId/:cardId',  auth.verifyToken, cardController.getCard);
router.put('/:workspaceId/:boardId/:listId/:cardId',  auth.verifyToken,  cardController.update);
router.post('/:workspaceId/:boardId/:listId/:cardId/add-comment',  auth.verifyToken, cardController.addComment);
router.put('/:workspaceId/:boardId/:listId/:cardId/:commentId', auth.verifyToken, cardController.updateComment);
router.delete('/:workspaceId/:boardId/:listId/:cardId/:commentId', auth.verifyToken, cardController.deleteComment);
module.exports = router;