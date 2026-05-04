const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const { profileSchema, validate } = require("../validators/index.js");
const adminController = require("../controllers/adminController.js");

router.get("/admin/dashboard", middleware.ensureAdminLoggedIn, adminController.getDashboard);
router.get("/admin/donations/pending", middleware.ensureAdminLoggedIn, adminController.getPendingDonations);
router.get("/admin/donations/previous", middleware.ensureAdminLoggedIn, adminController.getPreviousDonations);
router.get("/admin/donation/view/:donationId", middleware.ensureAdminLoggedIn, adminController.viewDonation);
router.get("/admin/donation/accept/:donationId", middleware.ensureAdminLoggedIn, adminController.acceptDonation);
router.get("/admin/donation/reject/:donationId", middleware.ensureAdminLoggedIn, adminController.rejectDonation);
router.get("/admin/donation/assign/:donationId", middleware.ensureAdminLoggedIn, adminController.getAssignAgent);
router.post("/admin/donation/assign/:donationId", middleware.ensureAdminLoggedIn, adminController.postAssignAgent);
router.get("/admin/agents", middleware.ensureAdminLoggedIn, adminController.getAgents);
router.get("/admin/profile", middleware.ensureAdminLoggedIn, adminController.getProfile);
router.put("/admin/profile", middleware.ensureAdminLoggedIn, validate(profileSchema), adminController.updateProfile);

module.exports = router;