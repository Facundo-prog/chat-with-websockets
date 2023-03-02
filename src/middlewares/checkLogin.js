const { verifyToken } = require('../cryptography/jwt');

const checkLogin = (req, res, next) => {
  const token =  req.cookies.user;

  if(!token || !verifyToken(token)){
    return res.redirect('/webchat/login');
  }
  next();
}

module.exports = checkLogin;