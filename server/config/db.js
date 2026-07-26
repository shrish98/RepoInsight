import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      mongoose.set('bufferCommands', false);
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('Connected to MongoDB Atlas');
    } else {
      console.log('MONGODB_URI not found in environment.');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
};

export default connectDB;
