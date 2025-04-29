const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
    cb(null, fileName);
  }
});

// File filter to accept only certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: fileFilter
});

// Upload document
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('Upload request received:', {
      file: req.file,
      body: req.body
    });

    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ 
        error: 'No file uploaded',
        details: 'Please select a file to upload'
      });
    }

    const fileInfo = {
      name: req.file.originalname,
      filename: req.file.filename,   
      path: req.file.path,
      type: req.body.documentType,
      size: req.file.size,
      uploadedAt: new Date(),
      url: `/uploads/${req.file.filename}`
    };

    console.log('File uploaded successfully:', fileInfo);

    // Here you would typically save the file information to your database
    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ 
      error: 'Error uploading file',
      details: error.message
    });
  }
});

// Get uploaded files
router.get('/files', (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../../uploads');
    const files = fs.readdirSync(uploadDir);
    
    const fileDetails = files.map(file => {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        size: stats.size,
        created: stats.ctime,
        url: `/uploads/${file}`
      };
    });

    res.json({
      success: true,
      files: fileDetails
    });
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({ 
      error: 'Error getting files',
      details: error.message
    });
  }
});

module.exports = router; 