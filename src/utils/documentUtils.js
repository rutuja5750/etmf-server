const Document = require('../models/document.model');

exports.generateDocumentNumber = async (documentType) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Get count of documents for this type in current month
  const count = await Document.countDocuments({
    documentType,
    createdAt: {
      $gte: new Date(year, date.getMonth(), 1),
      $lte: new Date(year, date.getMonth() + 1, 0)
    }
  });

  // Format: DOC-TYPE-YYYYMM-XXXX
  const sequence = String(count + 1).padStart(4, '0');
  return `${documentType}-${year}${month}-${sequence}`;
};

exports.isValidDocumentStatus = (currentStatus, newStatus, userRole) => {
  const validTransitions = {
    draft: ['in_review'],
    in_review: ['approved', 'rejected'],
    approved: ['archived'],
    rejected: ['draft'],
    archived: []
  };

  if (!validTransitions[currentStatus].includes(newStatus)) {
    return false;
  }

  const statusRoles = {
    in_review: ['admin', 'contributor'],
    approved: ['admin', 'manager'],
    rejected: ['admin', 'manager'],
    archived: ['admin']
  };

  return statusRoles[newStatus].includes(userRole);
}; 