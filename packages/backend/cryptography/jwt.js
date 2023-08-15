import jwt from 'jsonwebtoken';

export function signJwt(data, secret, expires = null){
  const options = {};
  expires ? options.expiresIn = expires : null;
  return jwt.sign(data, secret, options);
}

export function verifyJwt(token, secret){
  try{
    return jwt.verify(token, secret);
  } catch{
    return null;
  }
}