const donationService = require("../services/donationService.js");
const userService = require("../services/userService.js");

const adminController = {
	async getDashboard(req, res) {
		try {
			const [numAdmins, numDonors, numAgents, donationStats] = await Promise.all([
				userService.countByRole("admin"),
				userService.countByRole("donor"),
				userService.countByRole("agent"),
				donationService.getAdminDashboardStats()
			]);
			res.render("admin/dashboard", {
				title: "Dashboard",
				numAdmins, numDonors, numAgents, ...donationStats
			});
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async getPendingDonations(req, res) {
		try {
			const pendingDonations = await donationService.getAdminPendingDonations();
			res.render("admin/pendingDonations", { title: "Pending Donations", pendingDonations });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async getPreviousDonations(req, res) {
		try {
			const previousDonations = await donationService.getAdminPreviousDonations();
			res.render("admin/previousDonations", { title: "Previous Donations", previousDonations });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async viewDonation(req, res) {
		try {
			const donation = await donationService.findById(req.params.donationId, ["donor", "agent"]);
			res.render("admin/donation", { title: "Donation details", donation });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async acceptDonation(req, res) {
		try {
			const donationId = req.params.donationId;
			await donationService.updateStatus(donationId, "accepted");
			req.flash("success", "Donation accepted successfully");
			res.redirect(`/admin/donation/view/${donationId}`);
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async rejectDonation(req, res) {
		try {
			const donationId = req.params.donationId;
			await donationService.updateStatus(donationId, "rejected");
			req.flash("success", "Donation rejected successfully");
			res.redirect(`/admin/donation/view/${donationId}`);
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async getAssignAgent(req, res) {
		try {
			const [agents, donation] = await Promise.all([
				userService.findByRole("agent"),
				donationService.findById(req.params.donationId, ["donor"])
			]);
			res.render("admin/assignAgent", { title: "Assign agent", donation, agents });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async postAssignAgent(req, res) {
		try {
			const donationId = req.params.donationId;
			const { agent, adminToAgentMsg } = req.body;
			await donationService.updateStatus(donationId, "assigned", { agent, adminToAgentMsg });
			req.flash("success", "Agent assigned successfully");
			res.redirect(`/admin/donation/view/${donationId}`);
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async getAgents(req, res) {
		try {
			const agents = await userService.findByRole("agent");
			res.render("admin/agents", { title: "List of agents", agents });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	getProfile(req, res) {
		res.render("admin/profile", { title: "My profile" });
	},

	async updateProfile(req, res) {
		try {
			await userService.updateProfile(req.user._id, req.validatedBody);
			req.flash("success", "Profile updated successfully");
			res.redirect("/admin/profile");
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	}
};

module.exports = adminController;
