require('dotenv').config();

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'CORS_ORIGIN',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'TURNSTILE_SECRET',
  'RESEND_API_KEY',
  'FRONTEND_URL',
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`[FATAL] Missing required env variable: ${key}`);
    process.exit(1);
  }
}

module.exports = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: '7d',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  TURNSTILE_SECRET: process.env.TURNSTILE_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  SMTP_EMAIL: process.env.SMTP_EMAIL,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
};
