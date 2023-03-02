require("dotenv").config();

const config = {
  env: process.env.NODE_ENV || "dev",
  host: process.env.HOST || "localhost",
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtKey: process.env.JWT_KEY
}

module.exports = config;