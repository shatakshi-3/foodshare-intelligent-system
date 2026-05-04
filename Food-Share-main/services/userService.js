const User = require("../models/user.js");
const bcrypt = require("bcryptjs");

const userService = {
	async findByEmail(email) {
		return User.findOne({ email });
	},

	async createUser({ firstName, lastName, email, password, role }) {
		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(password, salt);
		const newUser = new User({ firstName, lastName, email, password: hash, role });
		return newUser.save();
	},

	async updateProfile(userId, updateData) {
		return User.findByIdAndUpdate(userId, updateData, { new: true });
	},

	async countByRole(role) {
		return User.countDocuments({ role });
	},

	async findByRole(role) {
		return User.find({ role });
	}
};

module.exports = userService;
