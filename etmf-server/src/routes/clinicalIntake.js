const express = require('express');
const router = express.Router();
const ClinicalIntake = require('../models/ClinicalIntake');

// Debug middleware for this route
router.use((req, res, next) => {
  console.log('Clinical Intake Route:', req.method, req.url);
  next();
});

// Submit clinical intake form
router.post('/submit', async (req, res) => {
  try {
    console.log('Received clinical intake submission:', JSON.stringify(req.body, null, 2));
    
    // Create new clinical intake document
    const clinicalIntake = new ClinicalIntake({
      ...req.body,
      submittedAt: new Date(),
      status: 'submitted'
    });

    // Save to MongoDB
    const savedIntake = await clinicalIntake.save();
    console.log('Saved clinical intake:', savedIntake._id);
    
    res.status(201).json({
      success: true,
      message: 'Clinical intake form submitted successfully',
      data: savedIntake
    });
  } catch (error) {
    console.error('Error saving clinical intake:', error);
    
    // Send more detailed error response
    res.status(500).json({
      success: false,
      message: 'Failed to save clinical intake form',
      error: error.message,
      validationErrors: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
  }
});

// Get all clinical intakes with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [clinicalIntakes, total] = await Promise.all([
      ClinicalIntake.find()
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
      ClinicalIntake.countDocuments()
    ]);

    res.json({
      success: true,
      data: clinicalIntakes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error retrieving clinical intakes:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving clinical intake forms',
      error: error.message
    });
  }
});

// Get clinical intake by ID
router.get('/:id', async (req, res) => {
  try {
    const clinicalIntake = await ClinicalIntake.findById(req.params.id);
    if (!clinicalIntake) {
      return res.status(404).json({
        success: false,
        message: 'Clinical intake form not found'
      });
    }
    res.json({
      success: true,
      data: clinicalIntake
    });
  } catch (error) {
    console.error('Error retrieving clinical intake:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving clinical intake form',
      error: error.message
    });
  }
});

module.exports = router; 