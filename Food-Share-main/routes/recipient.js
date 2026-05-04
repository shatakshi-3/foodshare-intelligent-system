const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const { recipientSchema, validate } = require("../validators/index.js");
const recipientController = require("../controllers/recipientController.js");

router.get("/admin/recipients", middleware.ensureAdminLoggedIn, recipientController.listRecipients);
router.get("/admin/recipient/add", middleware.ensureAdminLoggedIn, recipientController.getAddRecipient);
router.post("/admin/recipient/add", middleware.ensureAdminLoggedIn, validate(recipientSchema), recipientController.postAddRecipient);
router.get("/admin/recipient/view/:recipientId", middleware.ensureAdminLoggedIn, recipientController.viewRecipient);
router.get("/admin/recipient/edit/:recipientId", middleware.ensureAdminLoggedIn, recipientController.getEditRecipient);
router.post("/admin/recipient/edit/:recipientId", middleware.ensureAdminLoggedIn, validate(recipientSchema), recipientController.postEditRecipient);
router.get("/admin/recipient/toggle/:recipientId", middleware.ensureAdminLoggedIn, recipientController.toggleActive);

module.exports = router;
