const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  documentNumber: {
    type: String,
    required: true,
    unique: true
  },
  version: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['draft', 'in_review', 'approved', 'rejected', 'archived'],
    default: 'draft'
  },
  documentType: {
    type: String,
    required: true
  },
  classification: {
    zone: String,
    section: String,
    subsection: String
  },
  metadata: {
    studyId: String,
    sponsorName: String,
    investigatorName: String,
    siteNumber: String
  },
  fileUrl: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    comments: String,
    reviewedAt: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema); 