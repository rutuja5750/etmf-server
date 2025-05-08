const express = require('express');
const {
  createStudyProtocol,
  getAllStudyProtocols,
  getStudyProtocolById,
  updateStudyProtocol,
  deleteStudyProtocol,
  getStudyProtocolByNumber
} = require('../controllers/studyProtocol.controller');

const router = express.Router();

// Create a new study protocol
router.post('/', createStudyProtocol);

// Get all study protocols
router.get('/', getAllStudyProtocols);

// Get a specific study protocol by ID
router.get('/:id', getStudyProtocolById);

// Get a specific study protocol by protocol number
router.get('/protocol/:protocolNumber', getStudyProtocolByNumber);

// Update a study protocol
router.put('/:id', updateStudyProtocol);

// Delete a study protocol
router.delete('/:id', deleteStudyProtocol);

module.exports = router; 