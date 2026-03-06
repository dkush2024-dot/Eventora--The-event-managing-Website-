const cron = require('node-cron');
const Event = require('../models/Event');

const updateEventStatuses = async () => {
  const now = new Date();

  const events = await Event.find();

  for (let event of events) {
    const start = new Date(`${event.startDate.toISOString().split('T')[0]}T${event.startTime}`);
    const end = new Date(`${event.endDate.toISOString().split('T')[0]}T${event.endTime}`);

    let newStatus = 'Upcoming';
    if (now >= start && now <= end) {
      newStatus = 'Ongoing';
    } else if (now > end) {
      newStatus = 'Completed';
    }

    if (event.status !== newStatus) {
      event.status = newStatus;
      await event.save();
    }
  }
};

const startStatusUpdateCron = () => {
  cron.schedule('0 * * * *', () => {
    console.log('⏰ Running event status updater...');
    updateEventStatuses();
  });
};

module.exports = startStatusUpdateCron;
