const express = require('express');
const workspaceController = require('../Controllers/workspaceController');
const router = express.Router();
const auth = require("../Middlewares/auth");
router.post('/create',auth.verifyToken, workspaceController.create);
router.get("/get-workspaces", auth.verifyToken, workspaceController.getWorkspaces);
router.get("/get-workspace/:workspaceId", auth.verifyToken, workspaceController.getWorkspace);
router.post('/:workspaceId/add-member',auth.verifyToken, workspaceController.addMember);
router.delete('/:workspaceId/add-member',auth.verifyToken, workspaceController.deleteMember);
router.put("/update-workspaceDescription/:workspaceId", auth.verifyToken, workspaceController.updateWorkspaceDescription);
router.put("/update-workspaceName/:workspaceId", auth.verifyToken, workspaceController.updateWorkspaceName);
module.exports = router;
