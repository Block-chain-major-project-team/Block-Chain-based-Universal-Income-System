const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/list", userController.fetchAll);
router.get("/list/:id", userController.fetchSingle);
router.put("/update/:id", userController.updateUser);
router.delete("/delete/:id", userController.deleteUser);
router.post("/link-did", userController.linkDidAndWallet);


module.exports = router;
