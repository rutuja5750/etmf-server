const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const config = require('../config/config');
const path = require('path');

// Configure AWS
AWS.config.update({
  accessKeyId: config.awsAccessKey,
  secretAccessKey: config.awsSecretKey,
  region: 'us-east-1'
});

const s3 = new AWS.S3();

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.awsS3Bucket,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `${Date.now()}_${path.basename(file.originalname)}`;
      cb(null, fileName);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error('Invalid file type'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

module.exports = upload; 