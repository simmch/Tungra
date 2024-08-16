import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';  // Adjust the path as needed

dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const adminPassword = 'tungygold15';  // Change this to a secure password
    const hashedPassword = await bcrypt.hash(adminPassword, 8);

    const adminUser = new User({
      username: 'gog',
      password: hashedPassword,
      role: 'EDITOR'
    });

    await adminUser.save();

    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');  // Log the password you set
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createAdminUser();