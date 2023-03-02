const { sign, verify } = require("jsonwebtoken");
const config = require("../../config");

function newToken(data){
  return sign(data, config.jwtKey);
}

function verifyToken(token){
  try{
    return verify(token, config.jwtKey);
  } catch{
    return false;
  }
}

module.exports = { newToken, verifyToken }