require('dotenv').config();

const mongoose = require('mongoose');

const User = require('../models/User');

const ADMIN_NAME = 'Wanderlust Admin';
const ADMIN_EMAIL = 'admin@wanderlust.com';
const ADMIN_PASSWORD = 'Admin@123456';

const createAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        'MONGODB_URI is not configured in the environment variables'
      );
    }

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log('MongoDB Connected');

    let admin = await User.findOne({
      email: ADMIN_EMAIL.toLowerCase(),
    }).select('+password');

    if (admin) {
      admin.name = ADMIN_NAME;
      admin.password = ADMIN_PASSWORD;
      admin.role = 'ADMIN';
      admin.isActive = true;

      await admin.save();

      console.log(
        'Existing admin updated successfully'
      );
    } else {
      admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'ADMIN',
        isActive: true,
      });

      console.log(
        'New admin created successfully'
      );
    }

    console.log('');
    console.log('ADMIN LOGIN');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('Role:', admin.role);
    console.log('');

    await mongoose.disconnect();

    console.log(
      'MongoDB Disconnected'
    );
  } catch (error) {
    console.error(
      'Admin setup failed:',
      error.message
    );

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error(
        'MongoDB disconnect failed:',
        disconnectError.message
      );
    }

    process.exit(1);
  }
};

createAdmin();