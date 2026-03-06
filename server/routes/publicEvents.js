const express = require('express');
const {getAllEvents, getEventById} = require('../controllers/eventController');

const router = express.Router();

router.get('/', getAllEvents);           // GET all events
router.get('/:id', getEventById);        // GET single event

module.exports = router;