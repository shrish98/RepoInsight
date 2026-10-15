import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// No fallback secret: a guessable default would let anyone mint valid tokens.
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set. Add a long random value to server/.env (see README).');
}
if (JWT_SECRET.length < 32) {
  console.warn(
    'JWT_SECRET is shorter than 32 characters, which makes tokens easier to forge. Generate one with:\n' +
      '  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"',
  );
}

export const signToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d' });

// Pin the algorithm so a token can't pick its own.
export const verifyToken = (token) => jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
