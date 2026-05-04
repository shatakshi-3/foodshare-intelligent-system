const auditService = require("../services/auditService.js");

const auditController = {
	async viewLogs(req, res) {
		try {
			const { page = 1, action, targetModel } = req.query;
			const result = await auditService.getLogs({
				page: parseInt(page),
				action: action || undefined,
				targetModel: targetModel || undefined
			});
			res.render("admin/auditLogs", {
				title: "Audit Logs",
				...result,
				actionTypes: auditService.getActionTypes(),
				filters: { action: action || "", targetModel: targetModel || "" }
			});
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async viewLogDetail(req, res) {
		try {
			const log = await auditService.getLogById(req.params.logId);
			if (!log) {
				req.flash("error", "Audit log entry not found");
				return res.redirect("/admin/audit");
			}
			res.render("admin/auditLogDetail", { title: "Audit Log Detail", log });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async verifyChain(req, res) {
		try {
			const result = await auditService.verifyChain(100);
			res.render("admin/auditVerify", { title: "Chain Verification", result });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	}
};

module.exports = auditController;
