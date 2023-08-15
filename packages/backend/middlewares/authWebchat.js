import { verifyJwt } from '../cryptography/jwt.js';
import config from '../config/config.js';

export default (req, res, next) => {
  const token =  req.cookies?.webchat_user;

  if(!token || !verifyJwt(token, config.jwtSecret)){
    return res.redirect('/signin');
  }
  next();
}