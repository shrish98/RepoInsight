import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // GitHub accounts without a public verified email get their GitHub noreply address,
  // so email stays present and unique for every user.
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  // Only set for email sign-ups; GitHub accounts never have a password.
  password: {
    type: String
  },
  githubId: {
    type: String,
    unique: true,
    sparse: true
  },
  githubLogin: String,
  name: String,
  avatarUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const User = mongoose.model('User', userSchema);
