const { findOne } = require('../modals/boardModel');
const boardModel = require('../modals/boardModel');
const userModel = require('../modals/userModel');
const cardModel = require('../modals/cardModel');
const listModel = require('../modals/listModel');
const workspaceModel = require('../modals/workspaceModel');
const Workspace = require('../modals/workspaceModel');
const create = async (req,  user ,  callback) => {
	try {
		const { title, backgroundImageLink, members , workspaceId } = req.body;
		// Create and save new board
		let newBoard = boardModel({ title, backgroundImageLink ,owner:workspaceId});
		newBoard.save();
		// Get owner workspace
		const ownerworkspace = await workspaceModel.findById(workspaceId);
		// Add newboard's id to owner workspace
		 await ownerworkspace.boards.push(newBoard.id);
		// Add this board to owner's workspace 
		await ownerworkspace.save();
		// Add user to members of this board
		let allMembers = []; 
		allMembers.push({
			user: user.id,
			name: user.name,
			surname: user.surname,
			email: user.email,
			color: user.color,
			role: 'owner',
		});
		//Save newBoard's id to boards of members and,
		// Add ids of members to newBoard
		console.log(members);
		// await Promise.all(
		// 	members.map(async (member) => {
		// 		const newMember = await userModel.findOne({ email: member.email });
		// 		newMember.boards.push(newBoard._id);
		// 	 	await newMember.save();
		// 		 allMembers.push({
		// 			user: newMember._id,
		// 			name: newMember.name,
		// 			surname: newMember.surname,
		// 			email: newMember.email,
		// 			color: newMember.color,
		// 			role: 'member',
		// 		});
		// 		//Add to board activity
		// 		newBoard.activity.push({
		// 			user: user.id,
		// 			name: user.name,
		// 			action: `added user '${newMember.name}' to this board`,
		// 		});
		// 	})
		// );
		//Add created activity to activities of this board
		newBoard.activity.unshift({ user: user._id, name: user.name, action: 'created this board', color: user.color });
		// Save new board
		newBoard.members = allMembers;
		await newBoard.save();
		return callback(false, newBoard);
	} catch (error) {
		return callback({
			errMessage: '',
			details: error.message,
		});
	}
};
// const getAll = async (userId,workspaceId, callback) => {
// 	try {
// 		console.log("workspace:",workspaceId);
// 		// Get workspace
// 		const workspace = await workspaceModel.findById(workspaceId);
// 		// Get user
// 		const user = await userModel.findById(userId);
// 		// Get board's ids of workspace
// 		const boardIds = workspace.boards;
// 		// Get boards of workspace
// 		const boards = await boardModel.find({ _id: { $in: boardIds } });
// 		// Delete unneccesary objects
// 		boards.forEach((board) => {
// 			board.activity = undefined;
// 			board.lists = undefined;
// 		});
// 		return callback(false, boards);
// 	} catch (error) {
// 		return callback({ msg: 'Something went wrong', details: error.message });
// 	}
// };




const getAll = async (userId, workspaceId, callback) => {
	try {

	  // Get workspace
	  const workspace = await workspaceModel.findById(workspaceId);
	  // Get user
	  const user = await userModel.findById(userId);
	  // Check if the user is the owner of the workspace
	  console.log("workspace owner-> :",workspace.owner);
	  console.log(" UserId-> :",userId);
	  const isOwner = workspace.owner.equals(userId);
  console.log("ownerValue:",isOwner);
	  // Get board's ids of workspace
	  const boardIds = workspace.boards;
	  // Define a filter to use in the query
	  let filter = { _id: { $in: boardIds}};
	  // If the user is not the owner and is a member of the workspace,
	  // add an additional filter to only show boards the user is a member of
	  if (!isOwner) {
		filter.members = { $elemMatch: { user: userId } };
	  }
	  
	  // Get boards of the workspace based on the filter
	  const boards = await boardModel.find(filter);
	  // Delete unnecessary objects
	  boards.forEach((board) => {
		board.activity = undefined;
		board.lists = undefined;
	  });
	  return callback(false, boards);
	} catch (error) {
	  return callback({ msg: 'Something went wrong', details: error.message });
	}
  };
const getById = async (boardId, callback) => {
	try {
		// Get board by id
		const board = await boardModel.findById(boardId);
		return callback(false, board);
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};
const getActivityById = async ( workspaceId, boardId, callback) => {
	try {
		const Workspace = await workspaceModel.findById(workspaceId);
        // Check if the boardId belongs to the found workspace
        const isBoardInWorkspace = Workspace.boards.find(board => board.toString() === boardId);
        if (!isBoardInWorkspace) {
            return callback({ message: 'The provided boardId is not associated with this workspace.' }); }
		// Get board by id
		const board = await boardModel.findById(boardId);
		return callback(false, board.activity);
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};
const updateBoardTitle = async (workspaceId, boardId, title, user, callback) => {
    try {
        const Workspace = await workspaceModel.findById(workspaceId);    
        // Check if the boardId belongs to the found workspace
        const isBoardInWorkspace = Workspace.boards.find(board => board.toString() === boardId);
        if (!isBoardInWorkspace) {
            return callback({ message: 'The provided boardId is not associated with this workspace.' });
        }
        // Get board by id
        const board = await boardModel.findById(boardId);
        if (!board) {
            return callback({message: 'Board not found.' });
        }
        board.title = title;
        board.activity.unshift({
            user: user._id,
            name: user.name,
            action: 'update title of this board',
            color: user.color,
        });
        await board.save();
        return callback(false, { message: 'Success!' });
    } catch (error) {
        return callback({ message: 'Something went wrong', details: error.message });
    }
};
const updateBoardDescription = async ( workspaceId,boardId, description, user, callback) => {
	try {
		const Workspace = await workspaceModel.findById(workspaceId);
        // Check if the boardId belongs to the found workspace
        const isBoardInWorkspace = Workspace.boards.find(board => board.toString() === boardId);
        if (!isBoardInWorkspace) {
            return callback({ message: 'The provided boardId is not associated with this workspace.' }); }
		// Get board by id
		const board = await boardModel.findById(boardId);
		board.description = description;
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: 'update description of this board',
			color: user.color,
		});
		await board.save();
		return callback(false,{ message:'Success!'});
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};
const updateBackground = async (workspaceId, boardId, background, isImage, user, callback) => {
	try {
		const Workspace = await workspaceModel.findById(workspaceId);
        // Check if the boardId belongs to the found workspace
        const isBoardInWorkspace = Workspace.boards.find(board => board.toString() === boardId);
        if (!isBoardInWorkspace) {
            return callback({ message: 'The provided boardId is not associated with this workspace.' });}
		// Get board by id
		const board = await boardModel.findById(boardId);
		// Set variables
		board.backgroundImageLink = background;
		board.isImage = isImage;
		// Log the activity
		board.activity.unshift({
			user: user._id,
			name: user.name,
			action: 'update background of this board',
			color: user.color,
		});
		// Save changes
		await board.save();
		return callback(false, board);
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};
const addMember = async ( workspaceId,id, members, user, callback) => {
	try {
		// Get board by id
		const board = await boardModel.findById(id);
		const workspace = await workspaceModel.findById(workspaceId);
// Find the workspace object based on the matching workspaceId

const workspaceIdmatch = user.workspaces.find(workspace => workspace.toString() === workspaceId);
const boardIdmatch = workspace.boards.find(board => board.toString() === id);
	if (!(workspaceIdmatch&&boardIdmatch)) {
			return callback({ message: 'You can not add member to this board, you are not a member or owner!' });
	}
		// // Set variables
		// await Promise.all(
		// 	members.map(async (member) => {
		// 		const newMember = await userModel.findOne({ email: member.email });
		// 		console.log("new member",newMember);
		// 		newMember.workspace.boards.push(board._id);
		// 		await newMember.save();
		// 		board.members.push({
		// 			user: newMember._id,
		// 			name: newMember.name,
		// 			surname: newMember.surname,
		// 			email: newMember.email,
		// 			color: newMember.color,
		// 			role: 'member',
		// 		});
		    // Set variables
			await Promise.all(
				members.map(async (member) => {
				  const newMember = await userModel.findOne({ email: member.email });
		  
				//   // Check if the new member is in the same workspace as the board
				//   if (newMember.workspace.equals(workspaceId)) {
				// 	// Add the boardId to the new member's workspace's boards array
				// 	newMember.workspace.boards.push(board._id);
				// 	await newMember.workspace.save();
				//   }
				  const isMemberOfThisWorkspace = newMember.workspaces.find(workspace => workspace.toString() === workspaceId);
				//  console.log(" new memberworkspace boards",newMemberWorkspace.boards)
				  if (!(isMemberOfThisWorkspace)) {
					return callback({ message: ' To add in the Board member also should have member of this Workspace!' });
			}
			const newMemberWorkspace = await workspaceModel.findById(isMemberOfThisWorkspace);
			console.log(" new memberworkspace boards full:",newMemberWorkspace.boards)
				  newMemberWorkspace.boards.push(board._id);
				  await newMember.save();
				  board.members.push({
					user: newMember._id,
					name: newMember.name,
					surname: newMember.surname,
					email: newMember.email,
					color: newMember.color,
					role: 'member',
				  });
				//Add to board activity
				board.activity.push({
					user: user.id,
					name: user.name,
					action: `added user '${newMember.name}' to this board`,
					color: user.color,
				});
			})
		);
		// Save changes
		await board.save();
		return callback(null, board.members);
	} catch (error) {
		console.error(error); // Log the error for debugging purposes
		return callback({ message: 'Something went wrong', details: error.message });
	  }
};
const deleteById = async ( boardId, workspaceId,user, callback) => {
	try {
		// Get board to check the parent of board is this workspace
		const board = await boardModel.findById(boardId);
	if (board==null) return res.status(400).send({ errMessage: ' your board not found in  workspace boards' });
		// Get workspace to check the parent of board is this workspace
		const workspace = await workspaceModel.findById(workspaceId);
		 const validate = workspace.boards.filter((board) => board === boardId);
		 console.log("workspace",validate);
		if (!validate)
			return res.status(400).send({ errMessage: 'You can not delete the this board, you are not a member or owner!' });
		 console.log("hi workspace",workspace);
		// Delete the  booard
		const result = await boardModel.findByIdAndDelete(boardId);
		 // Delete the board from boards of workspace
              workspace.boards =  await workspace.boards.filter((board) =>board.toString() !==boardId);
		        await workspace.save();
// Delete all the cards associated with the lists on this board
		const listIds = board.lists.map(list => list.toString());
		await cardModel.deleteMany({ owner: { $in: listIds } });
// Delete all lists in the board
		await listModel.deleteMany({ owner: boardId });
		return callback(false, result);
	} catch (error) {
		return callback({ errMessage: 'Something went wrong', details: error.message });
	}
};
module.exports = {
	create,
	getAll,
	getById,
	getActivityById,
	updateBoardTitle,
	updateBoardDescription,
	updateBackground,
	addMember,
	deleteById
};
