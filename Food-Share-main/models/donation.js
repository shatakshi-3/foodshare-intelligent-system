const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
	donor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users",
		required: true
	},
	agent: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users",
	},
	foodType: {
		type: String,
		required: true
	},
	quantity: {
		type: Number,
		required: true
	},
	cookingTime: {
		type: Date,
		required: true
	},
	address: {
		type: String,
		required: true
	},
	phone: {
		type: Number,
		required: true
	},
	donorToAdminMsg: String,
	adminToAgentMsg: String,
	collectionTime: {
		type: Date,
	},
	status: {
		type: String,
		enum: ["pending", "rejected", "accepted", "assigned", "collected"],
		required: true
	},
}, {
	timestamps: true
});

// Index for admin dashboard: pending/accepted/assigned donation counts
donationSchema.index({ status: 1 });
// Index for donor dashboard: donations by a specific donor filtered by status
donationSchema.index({ donor: 1, status: 1 });
// Index for agent dashboard: donations assigned to a specific agent filtered by status
donationSchema.index({ agent: 1, status: 1 });

const Donation = mongoose.model("donations", donationSchema);
module.exports = Donation;