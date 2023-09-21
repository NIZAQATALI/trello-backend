const express = require("express");
const userController = require("../Controllers/userController");
const router = express.Router();
 const auth = require("../Middlewares/auth");
router.post("/register",  userController.register);
router.post("/login", userController.login);
router.get("/get-user",auth.verifyToken, userController.getUser);
router.post("/get-user-with-email",auth.verifyToken, userController.getUserWithMail);
router.post('/submit-otp', userController.submitotp)
router.post('/send-otp', userController.sendotp)
router.put("/update-user/:id", userController.updateUser);
module.exports = router;
