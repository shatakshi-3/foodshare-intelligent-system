const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
	action: {
		type: String,
		required: true,
		enum: [
			"donation_created", "donation_accepted", "donation_rejected",
			"donation_assigned", "donation_collected", "donation_deleted",
			"recipient_created", "recipient_updated", "recipient_toggled",
			"demand_created", "demand_status_updated", "demand_deleted",
			"match_generated", "llm_analysis_requested",
			"user_registered", "user_login", "user_logout",
			"profile_updated"
		]
	},
	performedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users"
	},
	targetModel: {
		type: String,
		enum: ["donation", "user", "recipient", "demand", "match"]
	},
	targetId: {
		type: mongoose.Schema.Types.ObjectId
	},
	details: {
		type: mongoose.Schema.Types.Mixed
	},
	previousState: {
		type: mongoose.Schema.Types.Mixed
	},
	newState: {
		type: mongoose.Schema.Types.Mixed
	},
	hash: {
		type: String,
		required: true
	},
	previousHash: {
		type: String,
		default: null
	},
	ipAddress: {
		type: String
	}
}, {
	timestamps: true
});

auditLogSchema.index({ action: 1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ targetModel: 1, targetId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ hash: 1 });

const AuditLog = mongoose.model("auditlogs", auditLogSchema);
module.exports = AuditLog;
