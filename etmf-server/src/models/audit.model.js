const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'status_change', 'review', 'download', 'delete']
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  previousState: mongoose.Schema.Types.Mixed,
  newState: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Audit', auditSchema); 