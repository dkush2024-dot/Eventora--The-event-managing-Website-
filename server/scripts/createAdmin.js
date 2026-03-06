const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Admin credentials - change these!
const ADMIN_EMAIL = 'admin@eventora.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME = 'Admin';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  avatar: String,
  role: {
    type: String,
    enum: ['Admin', 'Organizer', 'Participant'],
    default: 'Participant',
  },
  organizerApprovalStatus: String,
});

const User = mongoose.model('User', userSchema);

const createAdmin = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('Admin already exists!');
      console.log('Email:', ADMIN_EMAIL);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Create admin (use insertOne to bypass pre-save hook since we already hashed)
    const admin = await User.collection.insertOne({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'Admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=0ea5e9&color=fff',
      organizerApprovalStatus: 'not applied',
      registeredEvents: [],
      createdEvents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('\n✅ Admin created successfully!');
    console.log('================================');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('================================');
    console.log('\nYou can now login with these credentials.\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
