import crypto from 'crypto';
import { User } from '../models/User.js';
import { signToken } from '../config/auth.js';

const STATE_COOKIE = 'ri_oauth_state';
const STATE_COOKIE_PATH = '/api/auth/github';
const STATE_TTL_MS = 10 * 60 * 1000;

const isConfigured = () => Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);

// Must match the callback URL registered on the GitHub OAuth app. Set GITHUB_CALLBACK_URL when the
// app is reached through a proxy (e.g. the Vite dev server), where the request host differs.
const callbackUrl = (req) =>
  process.env.GITHUB_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/auth/github/callback`;

// Where the browser lands afterwards. Empty means "same origin as the API", which is how production runs.
const clientUrl = () => (process.env.CLIENT_URL || '').replace(/\/$/, '');

const readCookie = (req, name) => {
  const pair = (req.headers.cookie || '').split(';').map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : null;
};

const sameString = (a, b) => {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const githubFetch = async (url, accessToken) => {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'RepoInsight',
    },
  });
  if (!res.ok) throw new Error(`GitHub API ${url} responded ${res.status}`);
  return res.json();
};

const exchangeCodeForToken = async (code, redirectUri) => {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });
  const data = await res.json();
  if (!res.ok || data.error || !data.access_token) {
    throw new Error(`GitHub token exchange failed: ${data.error || res.status}`);
  }
  return data.access_token;
};

const fetchProfile = async (accessToken) => {
  const [profile, emails] = await Promise.all([
    githubFetch('https://api.github.com/user', accessToken),
    githubFetch('https://api.github.com/user/emails', accessToken).catch(() => []),
  ]);
  const verified = emails.filter((e) => e.verified);
  const email = (verified.find((e) => e.primary) || verified[0])?.email?.toLowerCase() || null;

  return {
    githubId: String(profile.id),
    githubLogin: profile.login,
    name: profile.name || profile.login,
    avatarUrl: profile.avatar_url,
    verifiedEmail: email,
    // GitHub's own format for a private, per-account address.
    fallbackEmail: `${profile.id}+${profile.login}@users.noreply.github.com`.toLowerCase(),
  };
};

export const findOrCreateUser = async (profile) => {
  let user = await User.findOne({ githubId: profile.githubId });

  // Link an existing email/password account, but only on an email GitHub has verified.
  if (!user && profile.verifiedEmail) {
    user = await User.findOne({ email: profile.verifiedEmail });
    if (user) user.githubId = profile.githubId;
  }

  if (!user) {
    user = new User({ githubId: profile.githubId, email: profile.verifiedEmail || profile.fallbackEmail });
  }

  user.githubLogin = profile.githubLogin;
  user.name = profile.name;
  user.avatarUrl = profile.avatarUrl;
  await user.save();
  return user;
};

export const startGithubLogin = (req, res) => {
  if (!isConfigured()) return res.redirect(`${clientUrl()}/login?error=github_unavailable`);

  const state = crypto.randomBytes(24).toString('hex');
  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure,
    maxAge: STATE_TTL_MS,
    path: STATE_COOKIE_PATH,
  });

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: callbackUrl(req),
    scope: 'read:user user:email',
    state,
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};

export const githubCallback = async (req, res) => {
  const { code, state, error } = req.query;
  const expectedState = readCookie(req, STATE_COOKIE);
  res.clearCookie(STATE_COOKIE, { path: STATE_COOKIE_PATH });

  const fail = (reason) => res.redirect(`${clientUrl()}/login?error=${reason}`);

  if (error) return fail('github_denied');
  // The state has to match the cookie set when this browser started the flow (login CSRF protection).
  if (!code || !state || !expectedState || !sameString(state, expectedState)) return fail('github_state');

  try {
    const accessToken = await exchangeCodeForToken(code, callbackUrl(req));
    const user = await findOrCreateUser(await fetchProfile(accessToken));
    // The token goes in the fragment, which browsers never send to servers, so it stays out of logs.
    res.redirect(`${clientUrl()}/auth/callback#token=${encodeURIComponent(signToken(user._id))}`);
  } catch (err) {
    console.error('GitHub sign-in failed:', err.message);
    fail('github_failed');
  }
};
