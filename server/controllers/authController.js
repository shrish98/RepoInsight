import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signToken } from '../config/auth.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
// bcrypt only looks at the first 72 bytes, so longer passwords give a false sense of strength.
const MAX_PASSWORD_LENGTH = 72;

export const publicUser = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
  githubLogin: user.githubLogin,
  avatarUrl: user.avatarUrl,
});

const readCredentials = (body = {}) => ({
  email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : '',
  password: typeof body.password === 'string' ? body.password : '',
});

export const registerUser = async (req, res) => {
  const { email, password } = readCredentials(req.body);
  if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `Passwords need ${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_LENGTH} characters.` });
  }

  try {
    if (await User.exists({ email })) return res.status(400).json({ error: 'An account with this email already exists.' });

    const user = await User.create({ email, password: await bcrypt.hash(password, 12) });
    res.json({ token: signToken(user._id), user: publicUser(user) });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Couldn’t create the account. Please try again.' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = readCredentials(req.body);
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const user = await User.findOne({ email });
    if (user && !user.password) {
      return res.status(400).json({ error: 'This account signs in with GitHub. Use “Continue with GitHub”.' });
    }
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    res.json({ token: signToken(user._id), user: publicUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Couldn’t sign you in. Please try again.' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(401).json({ error: 'Account not found.' });
    res.json({ user: publicUser(user) });
  } catch (error) {
    console.error('Fetch current user error:', error);
    res.status(500).json({ error: 'Couldn’t load your account.' });
  }
};
