const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const llmMatchingController = require("../controllers/llmMatchingController.js");

router.get("/admin/donation/ai-matches/:donationId", middleware.ensureAdminLoggedIn, llmMatchingController.viewLlmMatches);

module.exports = router;
