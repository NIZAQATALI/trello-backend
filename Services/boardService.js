const { findOne } = require('../modals/boardModel');
const boardModel = require('../modals/boardModel');
const userModel = require('../modals/userModel');
const cardModel = require('../modals/cardModel');
const listModel = require('../modals/listModel');
const create = async (req, callback) => {
	try {
		const { title, backgroundImageLink, members } = req.body;
		console.log(title)
		// Create and save new board
		let newBoard = boardModel({ title, backgroundImageLink });
		newBoard.save();
		// Add this board to owner's boards
		console.log(req.user.id)
		const user = await userModel.findById(req.user.id);
		console.log(user)
		if (!user) {
			return callback({
				errMessage: 'User not found',
			});
		}
		user.boards.unshift(newBoard.id);
		await user.save();
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
		// Save newBoard's id to boards of members and,
		// Add ids of members to newBoard
		console.log(members);
		await Promise.all(
			members.map(async (member) => {
				const newMember = await userModel.findOne({ email: member.email });
				newMember.boards.push(newBoard._id);
			 	await newMember.save();
				 allMembers.push({
					user: newMember._id,
					name: newMember.name,
					surname: newMember.surname,
					email: newMember.email,
					color: newMember.color,
					role: 'member',
				});
				//Add to board activity
				newBoard.activity.push({
					user: user.id,
					name: user.name,
					action: `added user '${newMember.name}' to this board`,
				});
			})
		);
		// Add created activity to activities of this board
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
const getAll = async (userId, callback) => {
	try {
		// Get user
		const user = await userModel.findById(userId);

		// Get board's ids of user
		const boardIds = user.boards;

		// Get boards of user
		const boards = await boardModel.find({ _id: { $in: boardIds } });

		// Delete unneccesary objects
		boards.forEach((board) => {
			board.activity = undefined;
			board.lists = undefined;
		});

		return callback(false, boards);
	} catch (error) {
		return callback({ msg: 'Something went wrong', details: error.message });
	}
};
const getById = async (id, callback) => {
	try {
		// Get board by id
		const board = await boardModel.findById(id);
		return callback(false, board);
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};
const getActivityById = async (id, callback) => {
	try {
		// Get board by id
		const board = await boardModel.findById(id);
		return callback(false, board.activity);
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};
const updateBoardTitle = async (boardId, title, user, callback) => {
	try {
		// Get board by id
		const board = await boardModel.findById(boardId);
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
const updateBoardDescription = async (boardId, description, user, callback) => {
	try {
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
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};

const updateBackground = async (id, background, isImage, user, callback) => {
	try {
		// Get board by id
		const board = await boardModel.findById(id);

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

const addMember = async (id, members, user, callback) => {
	try {
		// Get board by id
		const board = await boardModel.findById(id);
console.log("in the services")
console.log("board", board);
		// Set variables
		await Promise.all(
			members.map(async (member) => {
				const newMember = await userModel.findOne({ email: member.email });
				console.log("new member",newMember);
				newMember.boards.push(board._id);
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

		return callback(false, board.members);
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};

const deleteById = async ( boardId, user, callback) => {
	try {
		console.log(boardId);
		// Get board to check the parent of list is this board
		const board = await boardModel.findById(boardId);
		console.log(board);
		// Validate whether the owner of the board is the user who sent the request.
	     
		if (!user.boards.filter((board) => board === boardId))
			return callback({ errMessage: 'You cannot delete a list that does not hosted by your boards' });
		// Delete the  booard
		const result = await boardModel.findByIdAndDelete(boardId);
		// Delete the list from lists of board  // Delete the board from boards of user
		
                 user.boards =user.boards.filter((board) =>board.toString() !==boardId);
		
		
		user.save();
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
