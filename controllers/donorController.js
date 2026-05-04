const donationService = require("../services/donationService.js");
const userService = require("../services/userService.js");

const donorController = {
	async getDashboard(req, res) {
		try {
			const stats = await donationService.getDonorDashboardStats(req.user._id);
			res.render("donor/dashboard", { title: "Dashboard", ...stats });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	getDonateForm(req, res) {
		res.render("donor/donate", { title: "Donate" });
	},

	async postDonate(req, res) {
		try {
			const donationData = {
				...req.validatedBody,
				status: "pending",
				donor: req.user._id
			};
			await donationService.create(donationData);
			req.flash("success", "Donation request sent successfully");
			res.redirect("/donor/donations/pending");
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async getPendingDonations(req, res) {
		try {
			const pendingDonations = await donationService.getDonorPendingDonations(req.user._id);
			res.render("donor/pendingDonations", { title: "Pending Donations", pendingDonations });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async getPreviousDonations(req, res) {
		try {
			const previousDonations = await donationService.getDonorPreviousDonations(req.user._id);
			res.render("donor/previousDonations", { title: "Previous Donations", previousDonations });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async deleteRejected(req, res) {
		try {
			await donationService.deleteById(req.params.donationId);
			res.redirect("/donor/donations/pending");
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	getProfile(req, res) {
		res.render("donor/profile", { title: "My Profile" });
	},

	async updateProfile(req, res) {
		try {
			await userService.updateProfile(req.user._id, req.validatedBody);
			req.flash("success", "Profile updated successfully");
			res.redirect("/donor/profile");
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	}
};

module.exports = donorController;
