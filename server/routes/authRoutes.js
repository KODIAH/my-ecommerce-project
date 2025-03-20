const express = require('express');
const {
    signup,
    login,
    resetPassword,
    verifyCode,
    setNewPassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.post('/verify-code', verifyCode);
router.post('/set-new-password', setNewPassword);

module.exports = router;