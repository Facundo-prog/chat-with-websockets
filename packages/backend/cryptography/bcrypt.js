import bcrypt from 'bcryptjs';

export async function hashBcrypt(password){
  return await bcrypt.hash(password, 10);
}

export async function compareBcrypt(password, hash){
  return await bcrypt.compare(password, hash);
}