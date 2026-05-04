const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController.js");

router.get("/", homeController.welcome);
router.get("/home/about-us", homeController.aboutUs);
router.get("/home/mission", homeController.mission);
router.get("/home/contact-us", homeController.contactUs);

module.exports = router;