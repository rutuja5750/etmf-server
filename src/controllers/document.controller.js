const Document = require('../models/document.model');
const { generateDocumentNumber } = require('../utils/documentUtils');
const versionControlService = require('../services/versionControl.service');

exports.createDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { message: 'No file uploaded' }
      });
    }

    const documentNumber = await generateDocumentNumber(req.body.documentType);
    
    const document = new Document({
      title: req.body.title,
      documentNumber,
      documentType: req.body.documentType,
      classification: {
        zone: req.body.zone,
        section: req.body.section,
        subsection: req.body.subsection
      },
      metadata: {
        studyId: req.body.studyId,
        sponsorName: req.body.sponsorName,
        investigatorName: req.body.investigatorName,
        siteNumber: req.body.siteNumber
      },
      fileUrl: req.file.location,
      createdBy: req.user._id
    });

    await document.save();

    res.status(201).json({
      message: 'Document created successfully',
      document
    });
  } catch (error) {
    next(error);
  }
};

exports.getDocuments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, documentType } = req.query;
    const query = {};

    if (status) query.status = status;
    if (documentType) query.documentType = documentType;

    const documents = await Document.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('reviewers.user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        error: { message: 'Document not found' }
      });
    }

    // Store previous state for audit
    req.locals = { previousState: document.toObject() };

    // Check if user has permission to update
    if (document.status !== 'draft' && req.user.role !== 'admin') {
      return res.status(403).json({
        error: { message: 'Cannot modify document in current status' }
      });
    }

    const updates = {
      ...req.body,
      modifiedBy: req.user._id,
      version: document.version + 1
    };

    // Create new version before updating
    await versionControlService.createVersion(
      document,
      req.user,
      req.body.changes || 'Document updated'
    );

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('createdBy', 'firstName lastName email');

    res.json({
      message: 'Document updated successfully',
      document: updatedDocument
    });
  } catch (error) {
    next(error);
  }
};

exports.submitForReview = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        error: { message: 'Document not found' }
      });
    }

    if (document.status !== 'draft') {
      return res.status(400).json({
        error: { message: 'Document is not in draft status' }
      });
    }

    document.status = 'in_review';
    document.reviewers = req.body.reviewers.map(reviewerId => ({
      user: reviewerId,
      status: 'pending'
    }));

    await document.save();

    res.json({
      message: 'Document submitted for review',
      document
    });
  } catch (error) {
    next(error);
  }
};

exports.getVersions = async (req, res, next) => {
  try {
    const versions = await versionControlService.getVersions(req.params.id);
    res.json({ versions });
  } catch (error) {
    next(error);
  }
};

exports.revertToVersion = async (req, res, next) => {
  try {
    const { version } = req.params;
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        error: { message: 'Document not found' }
      });
    }

    const revertedData = await versionControlService.revertToVersion(
      document._id,
      parseInt(version),
      req.user
    );

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      {
        ...revertedData,
        version: document.version + 1,
        modifiedBy: req.user._id
      },
      { new: true }
    );

    res.json({
      message: 'Document reverted successfully',
      document: updatedDocument
    });
  } catch (error) {
    next(error);
  }
}; 