"use strict";
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

// TODO: add real admin auth middleware here, e.g. authenticate, authorize("admin")
// router.use(authenticate, authorize("admin"));

router.get("/admin/users", adminController.listUsers);
router.post("/admin/users/:id/freeze", adminController.freezeUser);
router.post("/admin/users/:id/unfreeze", adminController.unfreezeUser);

module.exports = router;