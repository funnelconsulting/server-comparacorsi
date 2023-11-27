const express = require('express');
const {register, login, updateUser, recoveryPassword, resetPassword, verifyEmail} = require('../controllers/auth');
const { sendEmail } = require('../controllers/sendEmail');

const router = express.Router();


router.post("/register", register);
router.post("/login", login);
router.post("/send-email", sendEmail);
router.put("/update-user", updateUser);
router.post('/recovery-password', recoveryPassword);
router.post("/reset-password", resetPassword);
router.post('/verify-email', verifyEmail);

module.exports = router;
