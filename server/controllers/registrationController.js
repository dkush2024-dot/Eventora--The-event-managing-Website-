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

    // Send registration confirmation email
    try {
      const eventDate = event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }) : 'TBD';

      await sendEmail(
          req.user.email,
          `✅ Registration Confirmed — ${event.title}`,
          `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">You're Registered! ✅</h1>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #1e293b; margin-top: 0;">Hi ${req.user.name},</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                You've successfully registered for <strong>${event.title}</strong>.
              </p>
              <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="color: #334155; margin: 4px 0;"><strong>📅 Date:</strong> ${eventDate}</p>
                <p style="color: #334155; margin: 4px 0;"><strong>⏰ Time:</strong> ${event.startTime || 'TBD'}</p>
                <p style="color: #334155; margin: 4px 0;"><strong>📍 Location:</strong> ${event.location || 'TBD'}</p>
                <p style="color: #334155; margin: 4px 0;"><strong>🏷️ Type:</strong> ${event.eventType || 'TBD'}</p>
              </div>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                We'll send you a reminder before the event starts. See you there!
              </p>
              <div style="text-align: center; margin-top: 24px;">
                <p style="color: #94a3b8; font-size: 14px;">— The Eventora Team</p>
              </div>
            </div>
          </div>`
      );
    } catch (emailError) {
      console.error('Registration confirmation email failed:', emailError.message);
    }

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

    // Send cancellation confirmation email
    try {
      const event = await Event.findById(eventId);
      const eventTitle = event ? event.title : 'the event';

      await sendEmail(
        req.user.email,
        `Registration Cancelled — ${eventTitle}`,
        `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Registration Cancelled</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${req.user.name},</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Your registration for <strong>${eventTitle}</strong> has been cancelled.
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              If this was a mistake, you can re-register for the event anytime before it starts.
            </p>
            <div style="text-align: center; margin-top: 24px;">
              <p style="color: #94a3b8; font-size: 14px;">— The Eventora Team</p>
            </div>
          </div>
        </div>`
      );
    } catch (emailError) {
      console.error('Cancellation email failed:', emailError.message);
    }

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
    const validRegistrations = registrations.filter(reg => reg.event !== null);
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