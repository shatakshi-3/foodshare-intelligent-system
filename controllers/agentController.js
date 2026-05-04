const donationService = require("../services/donationService.js");
const userService = require("../services/userService.js");
const auditService = require("../services/auditService.js");

const agentController = {
	async getDashboard(req, res) {
		try {
			const stats = await donationService.getAgentDashboardStats(req.user._id);
			res.render("agent/dashboard", { title: "Dashboard", ...stats });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async getPendingCollections(req, res) {
		try {
			const pendingCollections = await donationService.getAgentPendingCollections(req.user._id);
			res.render("agent/pendingCollections", { title: "Pending Collections", pendingCollections });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async getPreviousCollections(req, res) {
		try {
			const previousCollections = await donationService.getAgentPreviousCollections(req.user._id);
			res.render("agent/previousCollections", { title: "Previous Collections", previousCollections });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async viewCollection(req, res) {
		try {
			const collection = await donationService.findById(req.params.collectionId, ["donor"]);
			res.render("agent/collection", { title: "Collection details", collection });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async collectDonation(req, res) {
		try {
			const collectionId = req.params.collectionId;
			await donationService.updateStatus(collectionId, "collected", { collectionTime: Date.now() });
			await auditService.log({
				action: "donation_collected",
				performedBy: req.user._id,
				targetModel: "donation",
				targetId: collectionId,
				newState: { status: "collected" },
				ipAddress: req.ip
			});
			req.flash("success", "Donation collected successfully");
			res.redirect(`/agent/collection/view/${collectionId}`);
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	getProfile(req, res) {
		res.render("agent/profile", { title: "My Profile" });
	},

	async updateProfile(req, res) {
		try {
			await userService.updateProfile(req.user._id, req.validatedBody);
			req.flash("success", "Profile updated successfully");
			res.redirect("/agent/profile");
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	}
};

module.exports = agentController;
