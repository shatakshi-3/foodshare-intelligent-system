const matchingService = require("../services/matchingService.js");
const donationService = require("../services/donationService.js");
const auditService = require("../services/auditService.js");

const matchingController = {
	// Show match results for a specific donation
	async viewMatches(req, res) {
		try {
			const donation = await donationService.findById(req.params.donationId, ["donor"]);
			if (!donation) {
				req.flash("error", "Donation not found");
				return res.redirect("/admin/donations/pending");
			}

			const results = await matchingService.findMatches(donation);
			await auditService.log({
				action: "match_generated",
				performedBy: req.user._id,
				targetModel: "donation",
				targetId: donation._id,
				details: { matchCount: results.matchCount, topScore: results.matches[0]?.totalScore || 0 },
				ipAddress: req.ip
			});
			res.render("admin/matchResults", {
				title: "Match Results",
				donation,
				results
			});
		} catch (err) {
			console.log(err);
			req.flash("error", "Some error occurred while generating matches.");
			res.redirect("back");
		}
	}
};

module.exports = matchingController;
