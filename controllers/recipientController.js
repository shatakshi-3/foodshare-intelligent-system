const recipientService = require("../services/recipientService.js");

const recipientController = {
	async listRecipients(req, res) {
		try {
			const recipients = await recipientService.findAll();
			res.render("admin/recipients", { title: "Recipients", recipients });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	getAddRecipient(req, res) {
		res.render("admin/addRecipient", { title: "Add Recipient" });
	},

	async postAddRecipient(req, res) {
		try {
			await recipientService.create(req.validatedBody);
			req.flash("success", "Recipient added successfully");
			res.redirect("/admin/recipients");
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async viewRecipient(req, res) {
		try {
			const recipient = await recipientService.findById(req.params.recipientId);
			if (!recipient) {
				req.flash("error", "Recipient not found");
				return res.redirect("/admin/recipients");
			}
			res.render("admin/viewRecipient", { title: "Recipient Details", recipient });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async getEditRecipient(req, res) {
		try {
			const recipient = await recipientService.findById(req.params.recipientId);
			if (!recipient) {
				req.flash("error", "Recipient not found");
				return res.redirect("/admin/recipients");
			}
			res.render("admin/editRecipient", { title: "Edit Recipient", recipient });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async postEditRecipient(req, res) {
		try {
			await recipientService.update(req.params.recipientId, req.validatedBody);
			req.flash("success", "Recipient updated successfully");
			res.redirect(`/admin/recipient/view/${req.params.recipientId}`);
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async toggleActive(req, res) {
		try {
			const recipient = await recipientService.toggleActive(req.params.recipientId);
			req.flash("success", `Recipient ${recipient.isActive ? "activated" : "deactivated"} successfully`);
			res.redirect("/admin/recipients");
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	}
};

module.exports = recipientController;
