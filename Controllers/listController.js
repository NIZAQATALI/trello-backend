const listService = require('../Services/listService');
const create = async (req, res) => {
	const { workspaceId } = req.params;
   // Find the workspace object based on the matching workspaceId
    const workspace = req.user.workspaces.find(workspace => workspace.toString() === workspaceId);
    if (!workspace) {
        return res 
            .status(400)
            .send({ errMessage: 'Workspace not found or you do not have access to it.' });
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
	console.log(workspaceId," han yehi hai");
	const workspace = req.user.workspaces.find(workspace => workspace.toString() === workspaceId);
    if (!workspace) {
        return res 
            .status(400)
            .send({ errMessage: 'Workspace not found or you do not have access to it.' });
    }

	// Call the service to get all lists whose owner id matches the boardId
	await listService.getAll(boardId, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const deleteById = async (req, res) => {
	// deconstruct the params
	const { listId, boardId } = req.params;
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
	const { boardId, sourceId, destinationId, destinationIndex, cardId } = req.body;
	const user = req.user;
	// Validate the params
	
	if (!(boardId && sourceId && destinationId && cardId))
		return res.status(400).send({ errMessage: 'All parameters not provided' });

	// Validate the owner of board
	const validate = user.boards.filter((board) => board === boardId);
	if (!validate) return res.status(403).send({ errMessage: 'You cannot edit the board that you hasnt' });

	// Call the service
	await listService.updateCardOrder(boardId, sourceId, destinationId, destinationIndex, cardId, user, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const updateListOrder = async (req, res) => {
	// deconstruct the params
	const { boardId, sourceIndex, destinationIndex, listId } = req.body;
	const user = req.user;

	// Validate the params
	if (!(boardId && sourceIndex != undefined && destinationIndex != undefined && listId))
		return res.status(400).send({ errMessage: 'All parameters not provided' });
	// Validate the owner of board
	const validate = user.boards.filter((board) => board === boardId);
	if (!validate) return res.status(403).send({ errMessage: 'You cannot edit the board that you hasnt' });
	// Call the service
	await listService.updateListOrder(boardId, sourceIndex, destinationIndex, listId, (err, result) => {
		if (err) return res.status(500).send(err);
		return res.status(200).send(result);
	});
};
const updateListTitle = async (req, res) => {
	// deconstruct the params
	const { listId, boardId } = req.params;
	const user = req.user;
	const {title} = req.body;
	// Validate the listId and boardId
	if (!(listId && boardId)) return res.status(400).send({ errMessage: 'List or board undefined' });
	await listService.updateListTitle(listId, boardId, user,title, (err, result) => {
		if (err) return res.status(500).send(err);
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
};
