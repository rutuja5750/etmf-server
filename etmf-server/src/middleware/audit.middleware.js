const Audit = require('../models/audit.model');

const auditLogger = (action) => {
  return async (req, res, next) => {
    const originalSend = res.json;
    res.json = function (data) {
      res.locals.responseData = data;
      originalSend.call(this, data);
    };

    res.on('finish', async () => {
      try {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const auditEntry = new Audit({
            documentId: req.params.id || res.locals.responseData?.document?._id,
            action,
            performedBy: req.user._id,
            previousState: req.locals?.previousState,
            newState: res.locals.responseData?.document,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
          });

          await auditEntry.save();
        }
      } catch (error) {
        console.error('Audit logging error:', error);
      }
    });

    next();
  };
};

module.exports = auditLogger; 