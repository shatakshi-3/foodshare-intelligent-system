const Demand = require("../models/demand.js");

const demandService = {
	async create(demandData) {
		const demand = new Demand(demandData);
		return demand.save();
	},

	async findById(demandId, populateFields = []) {
		let query = Demand.findById(demandId);
		populateFields.forEach(field => { query = query.populate(field); });
		return query;
	},

	async findAll(filter = {}, populateFields = []) {
		let query = Demand.find(filter).sort({ createdAt: -1 });
		populateFields.forEach(field => { query = query.populate(field); });
		return query;
	},

	async findOpenDemands() {
		return Demand.find({ status: { $in: ["open", "partially_fulfilled"] } })
			.populate("recipient")
			.sort({ urgency: -1, createdAt: 1 });
	},

	async update(demandId, updateData) {
		return Demand.findByIdAndUpdate(demandId, updateData, { new: true });
	},

	async updateStatus(demandId, status) {
		return Demand.findByIdAndUpdate(demandId, { status }, { new: true });
	},

	async deleteById(demandId) {
		return Demand.findByIdAndDelete(demandId);
	},

	async countByStatus(status) {
		return Demand.countDocuments({ status });
	},

	async getDemandStats() {
		const [openCount, partialCount, fulfilledCount, expiredCount] = await Promise.all([
			Demand.countDocuments({ status: "open" }),
			Demand.countDocuments({ status: "partially_fulfilled" }),
			Demand.countDocuments({ status: "fulfilled" }),
			Demand.countDocuments({ status: "expired" })
		]);
		return { openCount, partialCount, fulfilledCount, expiredCount };
	}
};

module.exports = demandService;
