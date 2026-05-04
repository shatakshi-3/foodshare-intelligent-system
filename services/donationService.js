const Donation = require("../models/donation.js");

const donationService = {
	async create(donationData) {
		const donation = new Donation(donationData);
		return donation.save();
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
		return Donation.findByIdAndUpdate(donationId, { status, ...extraFields }, { new: true });
	},

	async deleteById(donationId) {
		return Donation.findByIdAndDelete(donationId);
	},

	async countByFilter(filter) {
		return Donation.countDocuments(filter);
	},

	// Dashboard statistics for admin
	async getAdminDashboardStats() {
		const [numPendingDonations, numAcceptedDonations, numAssignedDonations, numCollectedDonations] = await Promise.all([
			Donation.countDocuments({ status: "pending" }),
			Donation.countDocuments({ status: "accepted" }),
			Donation.countDocuments({ status: "assigned" }),
			Donation.countDocuments({ status: "collected" })
		]);
		return { numPendingDonations, numAcceptedDonations, numAssignedDonations, numCollectedDonations };
	},

	// Dashboard statistics for a specific donor
	async getDonorDashboardStats(donorId) {
		const [numPendingDonations, numAcceptedDonations, numAssignedDonations, numCollectedDonations] = await Promise.all([
			Donation.countDocuments({ donor: donorId, status: "pending" }),
			Donation.countDocuments({ donor: donorId, status: "accepted" }),
			Donation.countDocuments({ donor: donorId, status: "assigned" }),
			Donation.countDocuments({ donor: donorId, status: "collected" })
		]);
		return { numPendingDonations, numAcceptedDonations, numAssignedDonations, numCollectedDonations };
	},

	// Dashboard statistics for a specific agent
	async getAgentDashboardStats(agentId) {
		const [numAssignedDonations, numCollectedDonations] = await Promise.all([
			Donation.countDocuments({ agent: agentId, status: "assigned" }),
			Donation.countDocuments({ agent: agentId, status: "collected" })
		]);
		return { numAssignedDonations, numCollectedDonations };
	},

	// Get pending/active donations for a donor
	async getDonorPendingDonations(donorId) {
		return Donation.find({
			donor: donorId,
			status: { $in: ["pending", "rejected", "accepted", "assigned"] }
		}).populate("agent");
	},

	// Get collected donations for a donor
	async getDonorPreviousDonations(donorId) {
		return Donation.find({ donor: donorId, status: "collected" }).populate("agent");
	},

	// Get all pending/active donations (admin view)
	async getAdminPendingDonations() {
		return Donation.find({
			status: { $in: ["pending", "accepted", "assigned"] }
		}).populate("donor");
	},

	// Get all collected donations (admin view)
	async getAdminPreviousDonations() {
		return Donation.find({ status: "collected" }).populate("donor");
	},

	// Get pending collections for an agent
	async getAgentPendingCollections(agentId) {
		return Donation.find({ agent: agentId, status: "assigned" }).populate("donor");
	},

	// Get previous collections for an agent
	async getAgentPreviousCollections(agentId) {
		return Donation.find({ agent: agentId, status: "collected" }).populate("donor");
	}
};

module.exports = donationService;
