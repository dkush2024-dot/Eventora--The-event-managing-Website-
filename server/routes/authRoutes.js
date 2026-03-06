const express = require('express');
const { registerUser, loginUser, googleLoginUser } = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/register
router.post('/register', registerUser);

// @route   POST /api/auth/login
router.post('/login', loginUser);

//@route POST /api/auth/google-login
router.post('/google-login', googleLoginUser);

module.exports = router;