const DocumentVersion = require('../models/documentVersion.model');
const fs = require('fs');
const path = require('path');

class VersionControlService {
  async createVersion(document, user, changes) {
    const version = new DocumentVersion({
      documentId: document._id,
      version: document.version,
      fileUrl: document.fileUrl,
      changes,
      createdBy: user._id,
      metadata: {
        title: document.title,
        documentType: document.documentType,
        classification: document.classification,
        studyId: document.metadata.studyId,
        sponsorName: document.metadata.sponsorName,
        investigatorName: document.metadata.investigatorName,
        siteNumber: document.metadata.siteNumber
      }
    });

    await version.save();
    return version;
  }

  async getVersions(documentId) {
    return await DocumentVersion.find({ documentId })
      .sort({ version: -1 })
      .populate('createdBy', 'firstName lastName email');
  }

  async getVersion(documentId, version) {
    return await DocumentVersion.findOne({ documentId, version })
      .populate('createdBy', 'firstName lastName email');
  }

  async revertToVersion(documentId, version, user) {
    const documentVersion = await this.getVersion(documentId, version);
    if (!documentVersion) {
      throw new Error('Version not found');
    }

    // Copy file to new location using local file system
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const oldPath = path.join(uploadsDir, path.basename(documentVersion.fileUrl));
    const newFileName = `reverted_${Date.now()}_${path.basename(documentVersion.fileUrl)}`;
    const newPath = path.join(uploadsDir, newFileName);

    if (fs.existsSync(oldPath)) {
      fs.copyFileSync(oldPath, newPath);
    }

    return {
      fileUrl: `/uploads/${newFileName}`,
      metadata: documentVersion.metadata
    };
  }
}

module.exports = new VersionControlService(); 