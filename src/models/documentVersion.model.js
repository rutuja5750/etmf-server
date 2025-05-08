const mongoose = require('mongoose');

const documentVersionSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  changes: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    title: String,
    documentType: String,
    classification: {
      zone: String,
      section: String,
      subsection: String
    },
    studyId: String,
    sponsorName: String,
    investigatorName: String,
    siteNumber: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DocumentVersion', documentVersionSchema); 