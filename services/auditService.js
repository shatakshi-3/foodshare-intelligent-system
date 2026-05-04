const crypto = require("crypto");
const AuditLog = require("../models/auditLog.js");

// Generate SHA-256 hash of the log entry data
function generateHash(data, previousHash) {
	const payload = JSON.stringify({
		action: data.action,
		performedBy: data.performedBy?.toString() || "system",
		targetModel: data.targetModel,
		targetId: data.targetId?.toString(),
		details: data.details,
		previousHash: previousHash || "genesis",
		timestamp: data.timestamp || new Date().toISOString()
	});
	return crypto.createHash("sha256").update(payload).digest("hex");
}

// Verify the integrity of a log entry by recomputing its hash
function verifyHash(logEntry) {
	const recomputed = generateHash({
		action: logEntry.action,
		performedBy: logEntry.performedBy,
		targetModel: logEntry.targetModel,
		targetId: logEntry.targetId,
		details: logEntry.details,
		timestamp: logEntry.createdAt.toISOString()
	}, logEntry.previousHash);
	return recomputed === logEntry.hash;
}

const auditService = {
	// Log an action with SHA-256 hash chain
	async log({ action, performedBy, targetModel, targetId, details, previousState, newState, ipAddress }) {
		// Get the most recent log entry's hash for chaining
		const lastLog = await AuditLog.findOne().sort({ createdAt: -1 }).select("hash").lean();
		const previousHash = lastLog ? lastLog.hash : null;

		const timestamp = new Date().toISOString();
		const hash = generateHash({
			action, performedBy, targetModel, targetId, details, timestamp
		}, previousHash);

		const logEntry = new AuditLog({
			action,
			performedBy,
			targetModel,
			targetId,
			details,
			previousState,
			newState,
			hash,
			previousHash,
			ipAddress
		});

		return logEntry.save();
	},

	// Get paginated audit logs with optional filters
	async getLogs({ page = 1, limit = 25, action, targetModel, performedBy } = {}) {
		const filter = {};
		if (action) filter.action = action;
		if (targetModel) filter.targetModel = targetModel;
		if (performedBy) filter.performedBy = performedBy;

		const total = await AuditLog.countDocuments(filter);
		const logs = await AuditLog.find(filter)
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit)
			.populate("performedBy", "firstName lastName email role")
			.lean();

		return {
			logs,
			total,
			page,
			totalPages: Math.ceil(total / limit)
		};
	},

	// Get a single log entry with full details
	async getLogById(logId) {
		return AuditLog.findById(logId)
			.populate("performedBy", "firstName lastName email role")
			.lean();
	},

	// Verify chain integrity for the last N entries
	async verifyChain(count = 50) {
		const logs = await AuditLog.find()
			.sort({ createdAt: -1 })
			.limit(count)
			.lean();

		const results = [];
		for (const log of logs) {
			const recomputed = generateHash({
				action: log.action,
				performedBy: log.performedBy,
				targetModel: log.targetModel,
				targetId: log.targetId,
				details: log.details,
				timestamp: log.createdAt.toISOString()
			}, log.previousHash);

			results.push({
				id: log._id,
				action: log.action,
				valid: recomputed === log.hash,
				createdAt: log.createdAt
			});
		}

		const allValid = results.every(r => r.valid);
		const invalidCount = results.filter(r => !r.valid).length;

		return { allValid, total: results.length, invalidCount, results };
	},

	// Get actions enum for filter dropdowns
	getActionTypes() {
		return [
			"donation_created", "donation_accepted", "donation_rejected",
			"donation_assigned", "donation_collected", "donation_deleted",
			"recipient_created", "recipient_updated", "recipient_toggled",
			"demand_created", "demand_status_updated", "demand_deleted",
			"match_generated", "llm_analysis_requested",
			"user_registered", "user_login", "user_logout",
			"profile_updated"
		];
	}
};

module.exports = auditService;
