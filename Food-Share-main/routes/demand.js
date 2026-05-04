const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const { demandSchema, validate } = require("../validators/index.js");
const demandController = require("../controllers/demandController.js");

router.get("/admin/demands", middleware.ensureAdminLoggedIn, demandController.listDemands);
router.get("/admin/demand/add", middleware.ensureAdminLoggedIn, demandController.getAddDemand);
router.post("/admin/demand/add", middleware.ensureAdminLoggedIn, validate(demandSchema), demandController.postAddDemand);
router.get("/admin/demand/view/:demandId", middleware.ensureAdminLoggedIn, demandController.viewDemand);
router.post("/admin/demand/status/:demandId", middleware.ensureAdminLoggedIn, demandController.updateStatus);
router.get("/admin/demand/delete/:demandId", middleware.ensureAdminLoggedIn, demandController.deleteDemand);

module.exports = router;
