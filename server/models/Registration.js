const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  cancelled: {
    type: Boolean,
    default: false
  }, 
  reminderSent: {
    type : Boolean,
    default : false
  } 
});

module.exports = mongoose.model('Registration', registrationSchema);
