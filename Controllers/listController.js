const listService = require('../Services/listService');
const create = async (req, res) => {
	const { workspaceId } = req.params;
   // Find the workspace object based on the matching workspaceId
    const workspace = req.user.workspaces.find(workspace => workspace.toString() === workspaceId);
    if (!workspace) {
        return res 
            .status(400)
            .send({ errMessage: 'Workspace not found or you do not have access to it.'});
    }
	// Deconstruct the body
	const { title, boardId } = req.body;
	console.log("in the list")
	// Validate the title
	if (!(title && boardId)) return res.status(400).send({ errMessage: 'Title cannot be empty' });
	// Call the service to add new list
	await listService.create( { title: title, owner: boardId }, req.user, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(201).send(result);
	});
};
const getAll = async (req, res) => {
	// Assing parameter to constant
	const { workspaceId,boardId } = req.params;
	const userId = req.user.id
	console.log(workspaceId," han yehi hai");
	const workspace = req.user.workspaces.find(workspace => workspace.toString() === workspaceId);
    if (!workspace) {
        return res 
            .status(400)
            .send({ errMessage: 'Workspace not found or you do not have access to it.' });
    }
	// Call the service to get all lists whose owner id matches the boardId
	await listService.getAll(workspaceId,boardId, userId, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const deleteById = async (req, res) => {
	// deconstruct the params
	const { workspaceId, listId, boardId } = req.params;
 // Find the workspace object based on the matching workspaceId
 const workspace = req.user.workspaces.find(workspace => workspace.toString() === workspaceId);
 if (!workspace) {
	 return res 
		 .status(400)
		 .send({ errMessage: 'Workspace not found or you do not have access to it.' });
 }
	const user = req.user;
	// Validate the listId and boardId
	if (!(listId && boardId)) return res.status(400).send({ errMessage: 'List or board undefined' });
	await listService.deleteById(listId, boardId, user, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const updateCardOrder = async (req, res) => {
	// deconstruct the params
	const { workspaceId, boardId, sourceId, destinationId, destinationIndex, cardId } = req.body;
	const user = req.user;
	// Validate the params
	if (!(boardId && sourceId && destinationId && cardId))
		return res.status(400).send({ errMessage: 'All parameters not provided' });
	// Validate the owner of board
	
	// Call the service
	await listService.updateCardOrder(boardId, sourceId, destinationId, destinationIndex, cardId,  workspaceId,user, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const updateListOrder = async (req, res) => {
	// deconstruct the payload
	const {  workspaceId,boardId, sourceIndex, destinationIndex, listId } = req.body;
	console.log("these are values",workspaceId,boardId, sourceIndex, destinationIndex, listId )
	const user = req.user;
	// Validate the params
	if (!(workspaceId, boardId && sourceIndex != undefined && destinationIndex != undefined && listId))
		return res.status(400).send({ errMessage: 'All parameters not provided' });
	 // Find the workspace object based on the matching workspaceId
	 const workspace = req.user.workspaces.find(workspace => workspace.toString() === workspaceId);
	 if (!workspace) {
		 return res 
			 .status(400)
			 .send({ errMessage: 'Workspace not found or you do not have access to it.' });
	 }
	// Call the service
	await listService.updateListOrder( workspaceId,boardId, sourceIndex, destinationIndex, listId, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const updateListTitle = async (req, res) => {
	// deconstruct the params
	const { workspaceId, listId, boardId } = req.params;
	// Find the workspace object based on the matching workspaceId
	const workspace = req.user.workspaces.find(workspace => workspace.toString() === workspaceId);
	if (!workspace) {
		return res 
			.status(400)
			.send({ errMessage: 'Workspace not found or you do not have access to it.' });
	}
	const user = req.user;
	const {title} = req.body;
	// Validate the listId and boardId
	if (!(listId && boardId)) return res.status(400).send({ errMessage: 'List or board undefined' });
	await listService.updateListTitle(listId, boardId, user,title, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const addMemberToList = async (req, res) => {
    const {  workspaceId,boardId, listId } = req.params;
    const { members } = req.body; // Assuming members is an array of member objects
    await listService.addMemberToList( workspaceId,boardId, listId,  members, req.user, (err, result) => {
        if (err) {
            return res.status(400).send({ errMessage: err.message });
        }
        return res.status(200).send(result);
    });
};
module.exports = {
	create,
	getAll,
	deleteById,
	updateCardOrder,
	updateListOrder,
	updateListTitle,
	addMemberToList
};
