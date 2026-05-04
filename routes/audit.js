const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const auditController = require("../controllers/auditController.js");

router.get("/admin/audit", middleware.ensureAdminLoggedIn, auditController.viewLogs);
router.get("/admin/audit/view/:logId", middleware.ensureAdminLoggedIn, auditController.viewLogDetail);
router.get("/admin/audit/verify", middleware.ensureAdminLoggedIn, auditController.verifyChain);

module.exports = router;
