const User = require('../models/User.js');
const Registration = require('../models/Registration.js')

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