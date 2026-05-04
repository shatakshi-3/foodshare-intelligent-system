const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const { profileSchema, validate } = require("../validators/index.js");
const agentController = require("../controllers/agentController.js");

router.get("/agent/dashboard", middleware.ensureAgentLoggedIn, agentController.getDashboard);
router.get("/agent/collections/pending", middleware.ensureAgentLoggedIn, agentController.getPendingCollections);
router.get("/agent/collections/previous", middleware.ensureAgentLoggedIn, agentController.getPreviousCollections);
router.get("/agent/collection/view/:collectionId", middleware.ensureAgentLoggedIn, agentController.viewCollection);
router.get("/agent/collection/collect/:collectionId", middleware.ensureAgentLoggedIn, agentController.collectDonation);
router.get("/agent/profile", middleware.ensureAgentLoggedIn, agentController.getProfile);
router.put("/agent/profile", middleware.ensureAgentLoggedIn, validate(profileSchema), agentController.updateProfile);

module.exports = router;