const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const { donationSchema, profileSchema, validate } = require("../validators/index.js");
const donorController = require("../controllers/donorController.js");

router.get("/donor/dashboard", middleware.ensureDonorLoggedIn, donorController.getDashboard);
router.get("/donor/donate", middleware.ensureDonorLoggedIn, donorController.getDonateForm);
router.post("/donor/donate", middleware.ensureDonorLoggedIn, validate(donationSchema), donorController.postDonate);
router.get("/donor/donations/pending", middleware.ensureDonorLoggedIn, donorController.getPendingDonations);
router.get("/donor/donations/previous", middleware.ensureDonorLoggedIn, donorController.getPreviousDonations);
router.get("/donor/donation/deleteRejected/:donationId", donorController.deleteRejected);
router.get("/donor/profile", middleware.ensureDonorLoggedIn, donorController.getProfile);
router.put("/donor/profile", middleware.ensureDonorLoggedIn, validate(profileSchema), donorController.updateProfile);

module.exports = router;