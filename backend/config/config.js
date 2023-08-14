import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  env: process.env.NODE_ENV ?? 'dev',
  rootPath: path.join(__dirname, '../') ?? "",
  port: process.env.PORT ?? 3001,
  jwtSecret: process.env.JWT_SECRET ?? "",
} 

export default config;