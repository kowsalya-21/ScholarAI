import jwt from 'jsonwebtoken';

/**
 * Generate a JSON Web Token for the user
 * @param {string} userId - Mongoose User ID
 * @returns {string} Signed JWT Token
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'development_secret_key_change_me_in_production';

  return jwt.sign({ id: userId }, secret, {
    expiresIn: '7d',
  });
};

export default generateToken;
