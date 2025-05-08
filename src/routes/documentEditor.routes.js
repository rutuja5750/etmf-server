const express = require('express');
const {
    createSection,
    getAllSections,
    updateSection,
    deleteSection,
    deleteAllSections,
    addNewVersion,
    getSectionVersions
} = require('../controllers/documentEditor.controller');

const router = express.Router();

router.post('/create', createSection);
router.get('/all', getAllSections);
router.put('/update/:id', updateSection);
router.delete('/delete/:id', deleteSection);
router.delete('/deleteAll', deleteAllSections);

//For the version of the document (Sections)
router.post('/createVersion', addNewVersion);
router.get('/allVersions/:sectionId', getSectionVersions);



module.exports = router; 