const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const matchingController = require("../controllers/matchingController.js");

router.get("/admin/donation/matches/:donationId", middleware.ensureAdminLoggedIn, matchingController.viewMatches);

module.exports = router;
