import jwt from 'jsonwebtoken';

/**
 * Generate a JSON Web Token for the user
 * @param {string} userId - Mongoose User ID
 * @returns {string} Signed JWT Token
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in the environment variables.');
  }

  return jwt.sign({ id: userId }, secret, {
    expiresIn: '7d',
  });
};

export default generateToken;
