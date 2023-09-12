const boardModel = require('../modals/boardModel');
const userModel = require('../modals/userModel');
const cardModel = require('../modals/cardModel');
const listModel = require('../modals/listModel');
const workspaceModel = require('../modals/workspaceModel');
const create = async (req, callback) => {
	try {
        const { name, type, description } = req.body;
		// Create and save new board
		let newworkspace = workspaceModel({ name, type, description});
		newworkspace.save();
		// Add this board to owner's boards
		console.log(req.user.id)
		const user = await userModel.findById(req.user.id);
		console.log(user)
		if (!user) {
			return callback({
				errMessage: 'User not found',
			});
		}
		user.workspaces.unshift(newworkspace.id);
		await user.save();
		// Add user to members of this workspace
		let allMembers = []; 
		allMembers.push({
			user: user.id,
			name: user.name,
			surname: user.surname,
			email: user.email,
			color: user.color,
			role: 'owner',
		});
		// // Save newBoard's id to boards of members and,
		// // Add ids of members to newBoard
		// console.log(members);
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
		// Add created activity to activities of this board
	//	newBoard.activity.unshift({ user: user._id, name: user.name, action: 'created this board', color: user.color });
		// Save new board
		newworkspace.members = allMembers;
		await newworkspace.save();
		return callback(false, newworkspace);
	} catch (error) {
		return callback({
			errMessage: '',
			details: error.message,
		});
	}
};
const getWorkspaces = async (userId, callback) => {
	try {
		// Get user
		const user = await userModel.findById(userId);

		// Get board's ids of user
		const boardIds = user.workspaces;
		// Get boards of user
		const workspaces = await workspaceModel.find({ _id: { $in: boardIds } });
		console.log(workspaces);
		return callback(false, workspaces);
	} catch (error) {
		return callback({ msg: 'Something went wrong', details: error.message });
	}
};
const getWorkspace = async (id, callback) => {
	try {
		console.log(" in the workspaceService  ");
		// Get board by id
		const workspace = await workspaceModel.findById(id);
		return callback(false, workspace);
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};
const updateWorkspaceName = async (wsId, name, user, callback) => {
	try {
		// Get board by id
		const workspace = await workspaceModel.findById(wsId);
		workspace.name = name;
		await workspace.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};
const updateWorkspaceDescription = async (workspaceId, description, user, callback) => {
	try {
		// Get workspace by id
		const workspace = await workspaceModel.findById(workspaceId);
		workspace.description = description;
		
		await workspace.save();
		return callback(false, { message: 'Success!' });
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};
const addMember = async (id, members, user, callback) => {
	try {
		// Get workspace by id
		const workspace = await workspaceModel.findById(id);
		// Set variables
		await Promise.all(
			members.map(async (member) => {
				const newMember = await userModel.findOne({ email: member.email });
				console.log("new member",newMember);
				newMember.workspaces.push(workspace._id);
				await newMember.save();
				workspace.members.push({
					user: newMember._id,
					name: newMember.name,
					surname: newMember.surname,
					email: newMember.email,
					color: newMember.color,
					role: 'member',
				});
			})
		);
		// Save changes
		await workspace.save();
		return callback(false, workspace.members);
	} catch (error) {
		return callback({ message: 'Something went wrong', details: error.message });
	}
};
module.exports = {
create,
getWorkspaces,
getWorkspace,
updateWorkspaceDescription,
updateWorkspaceName,
addMember
}