const express = require('express');
const { body } = require('express-validator');
const documentController = require('../controllers/document.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../services/fileUpload.service');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

router.post('/',
  protect,
  authorize('admin', 'contributor'),
  upload.single('file'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('documentType').trim().notEmpty().withMessage('Document type is required'),
    body('zone').trim().notEmpty().withMessage('Zone is required'),
    body('section').trim().notEmpty().withMessage('Section is required'),
    body('studyId').trim().notEmpty().withMessage('Study ID is required')
  ],
  validate,
  documentController.createDocument
);

router.get('/',
  protect,
  documentController.getDocuments
);

router.put('/:id',
  protect,
  authorize('admin', 'contributor'),
  [
    body('title').optional().trim().notEmpty(),
    body('documentType').optional().trim().notEmpty(),
    body('status').optional().isIn(['draft', 'in_review', 'approved', 'rejected', 'archived'])
  ],
  validate,
  documentController.updateDocument
);

router.post('/:id/review',
  protect,
  authorize('admin', 'manager'),
  [
    body('reviewers').isArray().withMessage('Reviewers must be an array'),
    body('reviewers.*').isMongoId().withMessage('Invalid reviewer ID')
  ],
  validate,
  documentController.submitForReview
);

router.get('/:id/versions',
  protect,
  documentController.getVersions
);

router.post('/:id/revert/:version',
  protect,
  authorize('admin', 'manager'),
  documentController.revertToVersion
);

module.exports = router; 