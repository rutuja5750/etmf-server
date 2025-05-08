const { DocumentEditor, SectionVersion } = require('../models/docuementEditor.model');

exports.createSection = async (req, res) => {
    try {
      // The req.body now contains a single section's data
      const document = new DocumentEditor(req.body);

      // console.log(req.body);
      
      await document.save();
  
      res.status(201).json({
        message: 'Section created successfully',
        document
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
};

exports.getAllSections = async (req, res) => {
    try {
      const sections = await DocumentEditor.find();
      res.status(200).json(sections);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
};

exports.updateSection = async (req, res) => {
  // console.log("UPDATE SECTIONS",req.body);
    try {
      const section = await DocumentEditor.findByIdAndUpdate(req.params.id, req.body, { new: true });
      
      if (!section) {
        return res.status(404).json({ message: 'Section not found' });
      } else {
        res.status(200).json({
          message: 'Section updated successfully',
          section
        });
      } 
    }
    catch (error) {
      res.status(400).json({ error: error.message });
    }
};

exports.deleteSection = async (req, res) => {
  try {
    // Delete the section document
    const section = await DocumentEditor.findByIdAndDelete(req.params.id);

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    // Also delete any version history for this section
    const deletedVersions = await SectionVersion.deleteOne({ sectionId: req.params.id });
    
    // Return success response with details
    res.status(200).json({
      message: 'Section and its version history deleted successfully',
      section,
      versionHistoryDeleted: deletedVersions.deletedCount > 0
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete All the Section when clicked on the reset button
exports.deleteAllSections = async (req, res) => {
  try {
    // Delete all section documents
    const sections = await DocumentEditor.deleteMany();
    
    // Also delete all version history
    const deletedVersions = await SectionVersion.deleteMany();
    
    // Return success response with details
    res.status(200).json({
      message: 'All sections and their version history deleted successfully',
      sections,
      versionHistoryDeleted: deletedVersions.deletedCount > 0
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



//  Versioning of the document sections

// Controller function to add a new version
exports.addNewVersion = async (req, res) => {
  try {
    const { sectionId, title, context, prompt, output } = req.body;
    

    // console.log("ADD NEW VERSION ",req.body);
    
    // Validate required fields
    if (!sectionId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Document ID and title are required'
      });
    }

    // Find document version record or create new one
    let secVersion = await SectionVersion.findOne({ sectionId, title });
    
    if (!secVersion) {
      secVersion = new SectionVersion({
        sectionId,
        title,
        versions: []
      });
    }

    // Calculate next version number
    const nextVersionNumber = secVersion.versions.length > 0 
      ? Math.max(...secVersion.versions.map(v => v.versionNumber)) + 1 
      : 1;
    
    // Create new version entry
    const newVersion = {
      context: context || '',
      prompt: prompt || '',
      output: output || '',
      versionNumber: nextVersionNumber,
      createdAt: new Date()
    };

    // Add to versions array
    secVersion.versions.push(newVersion);
    
    // Save the updated document
    await secVersion.save();

    return res.status(201).json({
      success: true,
      data: {
        sectionId: secVersion.sectionId,
        title: secVersion.title,
        newVersion
      },
      message: `Version ${nextVersionNumber} created successfully`
    });
  } catch (error) {
    console.error('Error adding new version:', error);
    return res.status(500).json({
      success: false,
      message: 'Error adding new version',
      error: error.message
    });
  }
};

// Controller function to get all versions for a section
exports.getSectionVersions = async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    // console.log("GET SECTION VERSIONS ",sectionId);
    
    // Find document version record based on sectionId only
    const secVersion = await SectionVersion.findOne({ sectionId });
    
    // If no section version found
    if (!secVersion) {
      return res.status(404).json({
        success: false,
        message: 'No versions found for this section'
      });
    }
    
    // Return successful response with title and versions
    return res.status(200).json({
      success: true,
      data: {
        title: secVersion.title,
        versions: secVersion.versions
      },
      message: 'Successfully retrieved section versions'
    });
    
  } catch (error) {
    console.error('Error getting section versions:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting section versions',
      error: error.message
    });
  } 
};