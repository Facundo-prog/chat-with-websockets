const { hash, compare } = require("bcryptjs");

async function passwordHash(password){
  return await hash(password, 10);
}

async function verifyPassword(password, hash){
  return await compare(password, hash);
}

module.exports = { passwordHash, verifyPassword }