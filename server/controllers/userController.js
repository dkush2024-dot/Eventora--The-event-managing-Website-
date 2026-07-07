const User = require("../models/User");
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

const requestForOrganizer = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.organizerApprovalStatus === "pending") {
            return res.status(400).json({ message: "Request already pending" });
        }
        user.organizerApprovalStatus = "pending";
        await user.save();

        // Send confirmation email to user
        try {
            await sendEmail(
                user.email,
                'Organizer Request Received — Eventora',
                `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
                  <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 32px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Request Received 📋</h1>
                  </div>
                  <div style="padding: 32px;">
                    <h2 style="color: #1e293b; margin-top: 0;">Hi ${user.name},</h2>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                      We've received your request to become an <strong>Organizer</strong> on Eventora.
                    </p>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                      Our admin team will review your application and you'll receive an email notification once a decision has been made.
                    </p>
                    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                      In the meantime, you can continue browsing and registering for events.
                    </p>
                    <div style="text-align: center; margin-top: 24px;">
                      <p style="color: #94a3b8; font-size: 14px;">— The Eventora Team</p>
                    </div>
                  </div>
                </div>`
            );
        } catch (emailError) {
            console.error('Organizer request confirmation email failed:', emailError.message);
        }

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

    // Just assign the plain password — the pre('save') hook will hash it
    if (password) {
      user.password = password;
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
