const User = require('../models/User.js');
const Registration = require('../models/Registration.js');
const sendEmail = require('../utils/sendEmail.js');

const getPendingOrganizerRequests = async (req, res) => {
  try {
    const pendingUsers = await User.find({ organizerApprovalStatus: 'pending' }).select('-password');
    res.json(pendingUsers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const approveOrganizerRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.organizerApprovalStatus !== 'pending') {
      return res.status(404).json({ message: 'Pending request not found' });
    }

    user.organizerApprovalStatus = 'approved';
    user.role = 'Organizer';
    await user.save();

    // Send approval notification email
    try {
      await sendEmail(
        user.email,
        '🎉 You are now an Eventora Organizer!',
        `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Congratulations! 🎉</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${user.name},</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Great news! Your request to become an <strong>Organizer</strong> on Eventora has been <strong style="color: #16a34a;">approved</strong>.
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              You can now:
            </p>
            <ul style="color: #475569; font-size: 16px; line-height: 2;">
              <li>✅ Create and manage events</li>
              <li>✅ View registrations for your events</li>
              <li>✅ Edit and delete your events</li>
            </ul>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Log in to your dashboard to get started!
            </p>
            <div style="text-align: center; margin-top: 24px;">
              <p style="color: #94a3b8; font-size: 14px;">— The Eventora Team</p>
            </div>
          </div>
        </div>`
      );
    } catch (emailError) {
      console.error('Organizer approval email failed:', emailError.message);
    }

    res.json({ message: 'User approved as Organizer', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const rejectOrganizerRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.organizerApprovalStatus !== 'pending') {
      return res.status(404).json({ message: 'Pending request not found' });
    }

    user.organizerApprovalStatus = 'rejected';
    user.role = 'Participant';
    await user.save();

    // Send rejection notification email
    try {
      await sendEmail(
        user.email,
        'Organizer Request Update — Eventora',
        `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #475569, #64748b); padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Request Update</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${user.name},</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              Thank you for your interest in becoming an Organizer on Eventora.
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              After reviewing your request, we're unable to approve it at this time. This could be due to various reasons.
            </p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              You're welcome to submit a new request in the future. In the meantime, you can continue to browse and register for events as a participant.
            </p>
            <div style="text-align: center; margin-top: 24px;">
              <p style="color: #94a3b8; font-size: 14px;">— The Eventora Team</p>
            </div>
          </div>
        </div>`
      );
    } catch (emailError) {
      console.error('Organizer rejection email failed:', emailError.message);
    }

    res.json({ message: 'Organizer request rejected', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getRegistrationsForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await Registration.find({ event: eventId, cancelled: false })
      .populate('user', 'name email avatar role')
      .populate('event', 'title')// Select fields you want
      .sort({ registeredAt: -1 });
    res.json(registrations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching registrations' });
  }
};

module.exports = {getPendingOrganizerRequests, approveOrganizerRequest, rejectOrganizerRequest, getRegistrationsForEvent};