const ClinicalStudy = require('../models/studyProtocol.model');

// Create a new study protocol
const createStudyProtocol = async (req, res) => {
  try {
    const studyProtocol = new ClinicalStudy(req.body);
    const savedProtocol = await studyProtocol.save();
    res.status(201).json(savedProtocol);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all study protocols
const getAllStudyProtocols = async (req, res) => {
  try {
    const studyProtocols = await ClinicalStudy.find();
    res.status(200).json(studyProtocols);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single study protocol by ID
const getStudyProtocolById = async (req, res) => {
  try {
    const studyProtocol = await ClinicalStudy.findById(req.params.id);
    if (!studyProtocol) {
      return res.status(404).json({ message: 'Study protocol not found' });
    }
    res.status(200).json(studyProtocol);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a study protocol
const updateStudyProtocol = async (req, res) => {
  try {
    const updatedProtocol = await ClinicalStudy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProtocol) {
      return res.status(404).json({ message: 'Study protocol not found' });
    }
    res.status(200).json(updatedProtocol);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a study protocol
const deleteStudyProtocol = async (req, res) => {
  try {
    const deletedProtocol = await ClinicalStudy.findByIdAndDelete(req.params.id);
    if (!deletedProtocol) {
      return res.status(404).json({ message: 'Study protocol not found' });
    }
    res.status(200).json({ message: 'Study protocol deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get study protocol by protocol number
const getStudyProtocolByNumber = async (req, res) => {
  try {
    const studyProtocol = await ClinicalStudy.findOne({
      'study_identification.protocol_number': req.params.protocolNumber
    });
    if (!studyProtocol) {
      return res.status(404).json({ message: 'Study protocol not found' });
    }
    res.status(200).json(studyProtocol);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStudyProtocol,
  getAllStudyProtocols,
  getStudyProtocolById,
  updateStudyProtocol,
  deleteStudyProtocol,
  getStudyProtocolByNumber
}; 