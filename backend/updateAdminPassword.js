import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';  // Adjust the path as needed

dotenv.config();

const updateAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const newPassword = 'admin123';  // You can change this to any password you want
    const hashedPassword = await bcrypt.hash(newPassword, 8);

    const updatedUser = await User.findOneAndUpdate(
      { username: 'admin' },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (updatedUser) {
      console.log('Admin password updated successfully');
      console.log('Username:', updatedUser.username);
      console.log('New password (unhashed):', newPassword);
    } else {
      console.log('Admin user not found');
    }
  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    await mongoose.disconnect();
  }
};

updateAdminPassword();