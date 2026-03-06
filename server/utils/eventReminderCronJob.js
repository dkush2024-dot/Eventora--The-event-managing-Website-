const cron = require('node-cron');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const emailReminder = async () => {
  try {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const events = await Event.find({
      startDate: { $eq: twoHoursLater.toISOString().split('T')[0] },
      startTime: {
        $eq: twoHoursLater.toTimeString().split(':').slice(0, 2).join(':'),
      },
    });

    for (const event of events) {
      const registrations = await Registration.find({
        event: event._id,
        cancelled: false,
        reminderSent: false
      }).populate('user');

      for (const reg of registrations) {
        await sendEmail(
          reg.user.email,
          `Reminder: ${event.title} starts in 2 hours`,
          `<h3>Hi ${reg.user.name},</h3>
           <p>This is a reminder that <strong>${event.title}</strong> starts in less than 2 hours.</p>
           <p>Start Time: ${event.startDate} ${event.startTime}</p>`
        );
        reg.reminderSent = true;
        await reg.save(); 
      }
    }
  } catch (err) {
    console.error('Error in reminder cron job:', err);
  }
}

const reminderJob = () => {
    cron.schedule('0 * * * *', () => {
        console.log('⏰ Running reminder status sender...');
        emailReminder();
    });
};

module.exports = reminderJob;
