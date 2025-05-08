const mongoose = require('mongoose');

// Document Editor Schema
const documentEditorSchema = new mongoose.Schema({
    title: {
      type: String,
      trim: true,
      required: true
    },
    context: {
      type: String,
      default: ''
    },
    output: {
      type: String,
      default: ''
    },
    prompt: {
      type: String,
      default: ''
    }
}, { timestamps: true });

// Schema for version entries in the array
const versionEntrySchema = new mongoose.Schema({
  context: {
    type: String,
    default: ''
  },
  prompt: {
    type: String,
    default: ''
  },
  output: {
    type: String,
    default: ''
  },
  versionNumber: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Main document version schema
const sectionVersionSchema = new mongoose.Schema({
  // Reference to the original document
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DocumentEditor',
    required: true,
    index: true
  },
  // Title from the document
  title: {
    type: String,
    required: true,
    index: true
  },
  // Array of versions
  versions: [versionEntrySchema]
}, { 
  timestamps: true 
});

// Create compound index for efficient lookups
sectionVersionSchema.index({ sectionId: 1, title: 1 }, { unique: true });

// Create models
const DocumentEditor = mongoose.model('DocumentEditor', documentEditorSchema);
const SectionVersion = mongoose.model('SectionVersion', sectionVersionSchema);

// Export both models
module.exports = {
  DocumentEditor,
  SectionVersion
};