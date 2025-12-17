import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const userAuthorization = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = await User.findById(decoded.id).select('-password');

      return next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: Invalid Token' });
    }
  }

  return res.status(401).json({ message: 'Unauthorized: No Token' });
};

export default userAuthorization;
