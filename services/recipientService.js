const Recipient = require("../models/recipient.js");

const recipientService = {
	async create(recipientData) {
		const recipient = new Recipient(recipientData);
		return recipient.save();
	},

	async findById(recipientId) {
		return Recipient.findById(recipientId);
	},

	async findAll(filter = {}) {
		return Recipient.find(filter).sort({ createdAt: -1 });
	},

	async findActive() {
		return Recipient.find({ isActive: true }).sort({ name: 1 });
	},

	async update(recipientId, updateData) {
		return Recipient.findByIdAndUpdate(recipientId, updateData, { new: true });
	},

	async toggleActive(recipientId) {
		const recipient = await Recipient.findById(recipientId);
		if (!recipient) return null;
		recipient.isActive = !recipient.isActive;
		return recipient.save();
	},

	async countAll() {
		return Recipient.countDocuments({ isActive: true });
	}
};

module.exports = recipientService;
