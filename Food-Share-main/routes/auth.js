const express = require("express");
const router = express.Router();
const passport = require("passport");
const middleware = require("../middleware/index.js");
const { signupSchema, validate } = require("../validators/index.js");
const authController = require("../controllers/authController.js");

router.get("/auth/signup", middleware.ensureNotLoggedIn, authController.getSignup);
router.post("/auth/signup", middleware.ensureNotLoggedIn, validate(signupSchema), authController.postSignup);

router.get("/auth/login", middleware.ensureNotLoggedIn, authController.getLogin);
router.post("/auth/login", middleware.ensureNotLoggedIn,
	passport.authenticate("local", {
		failureRedirect: "/auth/login",
		failureFlash: true,
		successFlash: true
	}), authController.postLoginRedirect
);

router.get("/auth/logout", authController.logout);

module.exports = router;