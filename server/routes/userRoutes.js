const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requestForOrganizer, updateUserProfile} = require('../controllers/userController');

const router = express.Router();

router.put('/request-organizer', protect, requestForOrganizer);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
