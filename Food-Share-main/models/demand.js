const mongoose = require("mongoose");

const demandSchema = new mongoose.Schema({
	recipient: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "recipients",
		required: true
	},
	foodType: {
		type: String,
		required: true
	},
	quantityNeeded: {
		type: Number,
		required: true
	},
	urgency: {
		type: String,
		enum: ["low", "medium", "high"],
		required: true
	},
	location: {
		type: String,
		required: true
	},
	notes: {
		type: String
	},
	status: {
		type: String,
		enum: ["open", "partially_fulfilled", "fulfilled", "expired"],
		default: "open"
	},
	quantityFulfilled: {
		type: Number,
		default: 0
	}
}, {
	timestamps: true
});

demandSchema.index({ status: 1 });
demandSchema.index({ recipient: 1, status: 1 });
demandSchema.index({ urgency: 1, status: 1 });
demandSchema.index({ foodType: 1, status: 1 });

const Demand = mongoose.model("demands", demandSchema);
module.exports = Demand;
