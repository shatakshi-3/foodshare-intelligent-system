const mongoose = require("mongoose");

const recipientSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	type: {
		type: String,
		enum: ["ngo", "shelter", "community_kitchen", "orphanage", "other"],
		required: true
	},
	location: {
		type: String,
		required: true
	},
	contactName: {
		type: String,
		required: true
	},
	contactEmail: {
		type: String,
		required: true
	},
	contactPhone: {
		type: Number,
		required: true
	},
	isActive: {
		type: Boolean,
		default: true
	}
}, {
	timestamps: true
});

recipientSchema.index({ isActive: 1 });
recipientSchema.index({ location: 1 });

const Recipient = mongoose.model("recipients", recipientSchema);
module.exports = Recipient;
