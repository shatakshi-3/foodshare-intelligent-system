const matchingService = require("../services/matchingService.js");
const donationService = require("../services/donationService.js");
const llmService = require("../services/llmService.js");
const auditService = require("../services/auditService.js");

const llmMatchingController = {
	async viewLlmMatches(req, res) {
		try {
			const donation = await donationService.findById(req.params.donationId, ["donor"]);
			if (!donation) {
				req.flash("error", "Donation not found");
				return res.redirect("/admin/donations/pending");
			}

			if (!llmService.isAvailable()) {
				req.flash("error", "Gemini API key not configured. Add GEMINI_API_KEY to your .env file.");
				return res.redirect(`/admin/donation/matches/${req.params.donationId}`);
			}

			// First get deterministic results
			const deterministicResults = await matchingService.findMatches(donation);

			// Then get LLM analysis
			const llmAnalysis = await llmService.analyzeMatches(donation, deterministicResults);

			await auditService.log({
				action: "llm_analysis_requested",
				performedBy: req.user._id,
				targetModel: "donation",
				targetId: donation._id,
				details: { matchCount: deterministicResults.matchCount, recommendation: llmAnalysis.recommendation?.substring(0, 200) },
				ipAddress: req.ip
			});

			res.render("admin/llmMatchResults", {
				title: "AI-Enhanced Match Analysis",
				donation,
				deterministicResults,
				llmAnalysis
			});
		} catch (err) {
			console.log(err);
			req.flash("error", err.message || "Some error occurred during AI analysis.");
			res.redirect("back");
		}
	}
};

module.exports = llmMatchingController;
