const User = require("../models/User");
const bcrypt = require('bcryptjs')

const requestForOrganizer = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.organizerApprovalStatus === "pending") {
            return res.status(400).json({ message: "Request already pending" });
        }
        user.organizerApprovalStatus = "pending";
        await user.save();
        res.json({ message: "Organizer request submitted successfully" });
    } catch (err) {
        console.error("Error requesting organizer:", err);
        res.status(500).json({ message: "Server error" });
    }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, avatar, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      organizerApprovalStatus: user.organizerApprovalStatus,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

module.exports = { requestForOrganizer, updateUserProfile };
