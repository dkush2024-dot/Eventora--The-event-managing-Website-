const Registration = require('../models/Registration');
const Event = require('../models/Event');
const sendEmail = require('../utils/sendEmail');


const registerForEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if(event.status === 'Completed') return res.status(404).json({ message: 'Event has been completed.' });
    const existing = await Registration.findOne({ event: eventId, user: userId, cancelled: false });
    if (existing) return res.status(400).json({ message: 'Already registered for this event' });

    const registration = await Registration.create({ user: userId, event: eventId });

    await sendEmail(
        req.user.email,
        'Event Registration Confirmed',
        `<h3>Hi ${req.user.name},</h3>
        <p>You've successfully registered for <strong>${event.title}</strong>.</p>
        <p>Event Date: ${event.startDate} ${event.startTime}</p>
        <p>Thank you for registering!</p>`
    );

    res.status(201).json({ message: 'Registered successfully', registration });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const cancelRegistration = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  try {
    const registration = await Registration.findOne({ event: eventId, user: userId, cancelled: false });
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    registration.cancelled = true;
    await registration.save();

    res.json({ message: 'Registration cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyRegisteredEvents = async (req, res) => {
  const userId = req.user._id;

  try {
    const registrations = await Registration.find({ user: userId, cancelled: false })
      .populate({
        path: 'event',
        select: '-__v',
        populate: {
          path: 'organizer',
          select: 'name email',
        },
      });
    // console.log(registrations);
    const validRegistrations = registrations.filter(reg => reg.event !== null);
    // console.log(validRegistrations);
    res.json(validRegistrations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const isUserRegistered = async(req, res) => {
  const userId = req.user._id;
  const { eventId } = req.params;
  try {
    const registration = await Registration.findOne({ event: eventId, user: userId, cancelled: false });
    if(!registration) res.json({ message: 'No' });
    else res.json({ message: 'Yes' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}


module.exports = { getMyRegisteredEvents, cancelRegistration, registerForEvent, isUserRegistered};