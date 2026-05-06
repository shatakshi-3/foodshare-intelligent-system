const Donation = require("../models/donation.js");
const logger = require("../utils/logger.js");

const donationService = {
	async create(donationData) {
		const donation = new Donation(donationData);
		await donation.save();
		logger.info(`Donation created with ID: ${donation._id}`, { action: "donation_created", targetId: donation._id });
		return donation;
	},

	async findById(donationId, populateFields = []) {
		let query = Donation.findById(donationId);
		populateFields.forEach(field => { query = query.populate(field); });
		return query;
	},

	async findByFilter(filter, populateFields = []) {
		let query = Donation.find(filter);
		populateFields.forEach(field => { query = query.populate(field); });
		return query;
	},

	async updateStatus(donationId, status, extraFields = {}) {
		const updatedDonation = await Donation.findByIdAndUpdate(donationId, { status, ...extraFields }, { new: true });
		logger.info(`Donation status updated. ID: ${donationId}, Status: ${status}`, { action: "donation_status_updated", targetId: donationId, newStatus: status });
		return updatedDonation;
	},

	async deleteById(donationId) {
		const deletedDonation = await Donation.findByIdAndDelete(donationId);
		logger.info(`Donation deleted with ID: ${donationId}`, { action: "donation_deleted", targetId: donationId });
		return deletedDonation;
	},

	async countByFilter(filter) {
		return Donation.countDocuments(filter);
	},

	// Dashboard statistics for admin
	async getAdminDashboardStats() {
		const stats = await Donation.aggregate([
			{ $group: { _id: "$status", count: { $sum: 1 } } }
		]);
		const statsMap = stats.reduce((acc, curr) => {
			acc[curr._id] = curr.count;
			return acc;
		}, {});
		return {
			numPendingDonations: statsMap.pending || 0,
			numAcceptedDonations: statsMap.accepted || 0,
			numAssignedDonations: statsMap.assigned || 0,
			numCollectedDonations: statsMap.collected || 0
		};
	},

	// Dashboard statistics for a specific donor
	async getDonorDashboardStats(donorId) {
		const stats = await Donation.aggregate([
			{ $match: { donor: donorId } },
			{ $group: { _id: "$status", count: { $sum: 1 } } }
		]);
		const statsMap = stats.reduce((acc, curr) => {
			acc[curr._id] = curr.count;
			return acc;
		}, {});
		return {
			numPendingDonations: statsMap.pending || 0,
			numAcceptedDonations: statsMap.accepted || 0,
			numAssignedDonations: statsMap.assigned || 0,
			numCollectedDonations: statsMap.collected || 0
		};
	},

	// Dashboard statistics for a specific agent
	async getAgentDashboardStats(agentId) {
		const stats = await Donation.aggregate([
			{ $match: { agent: agentId, status: { $in: ["assigned", "collected"] } } },
			{ $group: { _id: "$status", count: { $sum: 1 } } }
		]);
		const statsMap = stats.reduce((acc, curr) => {
			acc[curr._id] = curr.count;
			return acc;
		}, {});
		return {
			numAssignedDonations: statsMap.assigned || 0,
			numCollectedDonations: statsMap.collected || 0
		};
	},

	// Get pending/active donations for a donor
	async getDonorPendingDonations(donorId, page = 1, limit = 10) {
		const filter = {
			donor: donorId,
			status: { $in: ["pending", "rejected", "accepted", "assigned"] }
		};
		const total = await Donation.countDocuments(filter);
		const donations = await Donation.find(filter)
			.populate("agent")
			.skip((page - 1) * limit)
			.limit(limit);
		return { donations, total, page, totalPages: Math.ceil(total / limit) };
	},

	// Get collected donations for a donor
	async getDonorPreviousDonations(donorId, page = 1, limit = 10) {
		const filter = { donor: donorId, status: "collected" };
		const total = await Donation.countDocuments(filter);
		const donations = await Donation.find(filter)
			.populate("agent")
			.skip((page - 1) * limit)
			.limit(limit);
		return { donations, total, page, totalPages: Math.ceil(total / limit) };
	},

	// Get all pending/active donations (admin view)
	async getAdminPendingDonations(page = 1, limit = 10) {
		const filter = { status: { $in: ["pending", "accepted", "assigned"] } };
		const total = await Donation.countDocuments(filter);
		const donations = await Donation.find(filter)
			.populate("donor")
			.skip((page - 1) * limit)
			.limit(limit);
		return { donations, total, page, totalPages: Math.ceil(total / limit) };
	},

	// Get all collected donations (admin view)
	async getAdminPreviousDonations(page = 1, limit = 10) {
		const filter = { status: "collected" };
		const total = await Donation.countDocuments(filter);
		const donations = await Donation.find(filter)
			.populate("donor")
			.skip((page - 1) * limit)
			.limit(limit);
		return { donations, total, page, totalPages: Math.ceil(total / limit) };
	},

	// Get pending collections for an agent
	async getAgentPendingCollections(agentId, page = 1, limit = 10) {
		const filter = { agent: agentId, status: "assigned" };
		const total = await Donation.countDocuments(filter);
		const donations = await Donation.find(filter)
			.populate("donor")
			.skip((page - 1) * limit)
			.limit(limit);
		return { donations, total, page, totalPages: Math.ceil(total / limit) };
	},

	// Get previous collections for an agent
	async getAgentPreviousCollections(agentId, page = 1, limit = 10) {
		const filter = { agent: agentId, status: "collected" };
		const total = await Donation.countDocuments(filter);
		const donations = await Donation.find(filter)
			.populate("donor")
			.skip((page - 1) * limit)
			.limit(limit);
		return { donations, total, page, totalPages: Math.ceil(total / limit) };
	}
};

module.exports = donationService;
