const dotenv = require('dotenv');
dotenv.config();

const config = {
  port: process.env.PORT || 7000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  environment: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  maxFileSize: process.env.MAX_FILE_SIZE || '50mb',
  awsS3Bucket: process.env.AWS_S3_BUCKET,
  awsAccessKey: process.env.AWS_ACCESS_KEY,
  awsSecretKey: process.env.AWS_SECRET_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
};

module.exports = config; 