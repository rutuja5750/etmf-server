const express = require('express');
const { getResult } = require('../controllers/ai.controller');
const { parseDocuments } = require('../controllers/ai.controller');

const router = express.Router();

// Route to get AI generation result
router.post('/get-result', getResult);

// Route to parse AI documents
router.post('/parse-documents', parseDocuments);

module.exports = router;