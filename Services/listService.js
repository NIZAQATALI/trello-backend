
const listModel = require('../modals/listModel');
const boardModel = require('../modals/boardModel');
const cardModel = require('../modals/cardModel');
const workspaceModel = require('../modals/workspaceModel');
const userModel = require('../modals/userModel');
const create = async ( model, user, callback) => {
	try {
		// Create new List
		const tempList = await listModel(model);
		// Save the new List
		const newList = await tempList.save();
		// Get owner board
		const ownerBoard = await boardModel.findById(model.owner);
		// Add newList's id to owner board
		ownerBoard.lists.push(newList.id);
		let allMembers = []; 
		allMembers.push({
			user: user.id,
			name: user.name,
			surname: user.surname,
			email: user.email,
			color: user.color,
			role: 'owner',
		});
 newList.members=allMembers;
await newList.save();
		// Add created activity to owner board activities
		ownerBoard.activity.unshift({
			user: user._id,
			name: user.name,
			action: `added ${newList.title} to this board`,
			color: user.color,
		});
		// Save changes
		ownerBoard.save();
		// Return new list
		return callback(false, newList);
	} catch (error) {
		// Return error message
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
// const getAll = async (boardId, callback) => {
// 	try {
// 		//get lists whose owner id equals to boardId param
// 		let lists = await listModel
// 			.find({ owner: { $in: boardId } })
// 			.populate({ path: 'cards' }) /* { path: 'cards', select: 'title' }) */
// 			.exec();
// 		// Order the lists
// 		const board = await boardModel.findById(boardId);
// 		let responseObject = board.lists.map((listId) => {
// 			return lists.filter((listObject) => listObject._id.toString() === listId.toString())[0];
// 		});
// 		return callback(false, responseObject);
// 	} catch (error) {
// 		return callback({ errMessage: 'Something went wrong', details: error.message });
// 	}
// };

const getAll = async ( workspaceId, boardId, userId, callback) => {
	try {

// Get  modals
	  const workspace = await workspaceModel.findById(workspaceId);
	   const board = await boardModel.findById(boardId);
	  const user = await userModel.findById(userId);
 // Check if the user is the owner of the workspace
	  console.log("workspace owner-> :",workspace.owner);
	  console.log(" UserId-> :",userId);
	  const isOwner = workspace.owner.equals(userId);
 // Get board's ids of workspace
	  const listIds = board.lists;
	  // Define a filter to use in the query
	  let filter = { _id: { $in: listIds}};
 // If the user is not the owner and is a member of the workspace,
	  // add an additional filter to only show boards the user is a member of
	  if (!isOwner) {
		filter.members = { $elemMatch: { user: userId } };
	  }
	  console.log("filter Value:",filter);
		 // Get lists of the board based on the filter
	  const lists = await listModel.find(filter);	
	  console.log("lists",lists);
	//   // Order the lists
	// 	let responseObject = board.lists.map((listId) => {
	// 		return lists.filter((listObject) => listObject._id.toString() === listId.toString())[0];
	// 	});
	//	console.log(responseObject);
		return callback(false, lists);
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};





const deleteById = async (listId, boardId, user, callback) => {
	try {
		// Get board to check the parent of list is this board
		const board = await boardModel.findById(boardId);
		console.log("this is board", board.lists);
		// Validate the parent of the list
		console.log("this is list",listId);
 // Find the workspace object based on the matching workspaceId
 const validate= board.lists.find(list => list.toString() === listId);
console.log(validate);
 if (!validate) {
	const errorMessage = 'List information is not correct or list not found';
	return callback({ errMessage: errorMessage});
}
 // Rest of your code if the list is found
		// const validate = board.lists.filter((list) => list.id.toString() === listId);
		// console.log(validate,"validate")
		// console.log(typeof validate," type of variable")
		// if (validate === false){ return callback({ errMessage: 'List or board informations are wrong' });}
		// console.log(validate);
		// Delete the list
		const result = await listModel.findByIdAndDelete(listId);
		// Delete the list from lists of board
		board.lists = board.lists.filter((list) => list.toString() !== listId);
		// Add activity log to board
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: `deleted ${result.title} from this board`,
			color: user.color,
		});
		board.save();
		// Delete all cars in the list
		await cardModel.deleteMany({ owner: listId });
		return callback(false, result);
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}	
};
const updateCardOrder = async (boardId, sourceId, destinationId, destinationIndex, cardId, workspaceId, user, callback) => {
	try {
		 console.log("in the service of card update order")
		// Validate the parent workspace and board of the lists
		const workspace = await workspaceModel.findById(workspaceId);
const validateWorkspace = workspace.boards.filter((board) => board === boardId);
	if (!validateWorkspace) return res.status(403).send({ errMessage: 'You cannot edit the board that you hasnt' });


		const board = await boardModel.findById(boardId);
		let validate = board.lists.filter((list) => list.id === sourceId);
		const validate2 = board.lists.filter((list) => list.id === destinationId);
		if (!validate || !validate2) return callback({ errMessage: 'List or board informations are wrong' });
		// Validate the parent list of the card
		const sourceList = await listModel.findById(sourceId);
		validate = sourceList.cards.filter((card) => card._id.toString() === cardId);
		if (!validate) return callback({ errMessage: 'List or card informations are wrong' });
		// Remove the card from source list and save
		sourceList.cards = sourceList.cards.filter((card) => card._id.toString() !== cardId);
		await sourceList.save();
		// Insert the card to destination list and save
		const card = await cardModel.findById(cardId);
		const destinationList = await listModel.findById(destinationId);
		const temp = Array.from(destinationList.cards);
		temp.splice(destinationIndex, 0, cardId);
		destinationList.cards = temp;
		await destinationList.save();
		// Add card activity
		if (sourceId !== destinationId)
			card.activities.unshift({
				text: `moved this card from ${sourceList.title} to ${destinationList.title}`,
				userName: user.name,
				color: user.color,
			});
		// Change owner board of card
		card.owner = destinationId;
		await card.save();
		return callback(false, { message: 'Success' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const updateListOrder = async ( workspaceId, boardId, sourceIndex, destinationIndex, listId, callback) => {
	try {
		// Validate the parent board of the lists
		const board = await boardModel.findById(boardId);
		let validate = board.lists.filter((list) => list.id === listId);
		if (!validate) return callback({ errMessage: 'List or board informations are wrong' });
		// Change list order
		board.lists.splice(sourceIndex, 1);
		board.lists.splice(destinationIndex, 0, listId);
		await board.save();
		return callback(false, { message: 'Success' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
const updateListTitle = async (listId, boardId, user, title, callback) => {
	try {
		// Get board to check the parent of list is this board
		const board = await boardModel.findById(boardId);
		const list = await listModel.findById(listId.toString());
		// Validate the parent of the list
		const validate = board.lists.find((list) => list.toString() === listId);
		if (!validate) return callback({ errMessage: 'List or board informations are wrong' });
	
		// Change title of list
		list.title = title;
		await list.save();
		return callback(false, { message: 'Success' });
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
 };

 const addMemberToList = async ( workspaceId,boardId, listId, members, user, callback) => {
    try {
        // Find the board by ID
        const board = await boardModel.findById(boardId);
		const workspace = await workspaceModel.findById(workspaceId);
		const list = await listModel.findById(listId);
        // Find the list within the board by ID
        const listIdFind = board.lists.find(list => list._id.toString() === listId);
        // Check if the list exists
        if (!list) {
            return callback({ message: 'List not found' });
        }
        const workspaceIdmatch = user.workspaces.find(workspace => workspace.toString() === workspaceId);

const boardIdmatch = workspace.boards.find(board => board.toString() === boardId);
const listIdmatch = board.lists.find(board => board.toString() === listId);
	if (!(workspaceIdmatch&&boardIdmatch&&listIdmatch)) {
			return callback({ message: 'You can not add member to this board, you are not  owner!' });
	}
        // Set variables
			await Promise.all(
				members.map(async (member) => {
				  const newMember = await userModel.findOne({ email: member.email });
				  console.log(" new memberworkspace boards",workspace.boards)
				  console.log(" new memberworkspace boards",boardId);
				  const isMemberOfThisBoard = workspace.boards.find(b=> b.toString() === boardId);
				  if (!(isMemberOfThisBoard)) {
					return callback({ message: ' To add in the list member also should have member of parent board!' });
			}
			const newMemberBoard = await boardModel.findById(isMemberOfThisBoard);
 // Check if the member is already in the list
 console.log("list.member->",list);
 const isMemberInList = list.members.find(member => member.toString() === newMember._id);
 if (isMemberInList) {
	 return callback({ message: 'Member is already in the list' });
 }
			console.log(" new memberBoard boards full:",newMemberBoard)
				  newMemberBoard.lists.push(list._id);
				  await newMember.save();
				  list.members.push({
					user: newMember._id,
					name: newMember.name,
					surname: newMember.surname,
					email: newMember.email,
					color: newMember.color,
					role: 'member',
				  });
				})
				);
        // Save changes to the board
        await list.save();
        return callback(null, list.members);
    } catch (error) {
        console.error(error);
        return callback({ message: 'Something went wrong', details: error.message });
    }
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
