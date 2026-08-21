const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const User = require('../models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) =>
  new Promise((resolve) => {
    rl.question(question, resolve);
  });

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = 'sarahiftikhar527@gmail.com';

    const password = await ask(
      'New admin password: '
    );

    if (!password || password.length < 6) {
      console.log(
        'Password must be at least 6 characters.'
      );
      return;
    }

    const user = await User.findOne({
      email,
    }).select('+password');

    if (!user) {
      console.log(
        `User not found: ${email}`
      );
      return;
    }

    user.password = password;
    user.role = 'ADMIN';
    user.isActive = true;

    await user.save();

    console.log(
      'Admin password updated successfully.'
    );
    console.log(
      `Admin email: ${email}`
    );
  } catch (error) {
    console.error(
      'Error:',
      error.message
    );
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
};

main();