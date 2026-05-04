const demandService = require("../services/demandService.js");
const recipientService = require("../services/recipientService.js");

const demandController = {
	async listDemands(req, res) {
		try {
			const demands = await demandService.findAll({}, ["recipient"]);
			res.render("admin/demands", { title: "Demands", demands });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async getAddDemand(req, res) {
		try {
			const recipients = await recipientService.findActive();
			res.render("admin/addDemand", { title: "Add Demand", recipients });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async postAddDemand(req, res) {
		try {
			await demandService.create(req.validatedBody);
			req.flash("success", "Demand created successfully");
			res.redirect("/admin/demands");
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async viewDemand(req, res) {
		try {
			const demand = await demandService.findById(req.params.demandId, ["recipient"]);
			if (!demand) {
				req.flash("error", "Demand not found");
				return res.redirect("/admin/demands");
			}
			res.render("admin/viewDemand", { title: "Demand Details", demand });
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async updateStatus(req, res) {
		try {
			const { status } = req.body;
			await demandService.updateStatus(req.params.demandId, status);
			req.flash("success", "Demand status updated successfully");
			res.redirect(`/admin/demand/view/${req.params.demandId}`);
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	},

	async deleteDemand(req, res) {
		try {
			await demandService.deleteById(req.params.demandId);
			req.flash("success", "Demand deleted successfully");
			res.redirect("/admin/demands");
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred on the server.");
			res.redirect("back");
		}
	}
};

module.exports = demandController;
