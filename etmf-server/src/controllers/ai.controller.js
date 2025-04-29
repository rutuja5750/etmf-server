const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateResult } = require('../services/ai.service');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const parseDocuments = async (req, res) => {
  try {
    const { files, formFields } = req.body;
    console.log('Received request with files:', files);
    console.log('Form fields:', formFields);

    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('No files provided for parsing');
    }

    let combinedText = '';

    for (const file of files) {
      console.log('Processing file:', file);

      const fileName = file.filename || file.originalname;
      const filePath = path.join(__dirname, '../../uploads', fileName);
      console.log('Looking for file at path:', filePath);

      await fs.access(filePath);
      console.log('File exists at path:', filePath);

      const pdfBuffer = await fs.readFile(filePath);

      const pdfData = await pdfParse(pdfBuffer);
      combinedText += pdfData.text + '\n';
    }

    if (!combinedText.trim()) {
      throw new Error('No readable text could be extracted from the provided documents');
    }

    const systemMessage = `You are a helpful assistant that extracts information from clinical trial documents.
The form has the following sections and fields:
${JSON.stringify(formFields, null, 2)}

For each field, extract the relevant information from the provided text. If the information is not found, respond with "Not Provided".
Format your response as a JSON object with the same structure as the form fields. Output ONLY valid JSON without markdown code blocks.`;

    // Use Gemini 1.5
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const result = await model.generateContent([systemMessage, combinedText]);
    const response = await result.response;
    let text = response.text();

    console.log('Raw Gemini Response:', text);

    // Clean markdown code blocks if present
    text = text.trim();
    if (text.startsWith('```')) {
      text = text.replace(/```[\s\S]*?\n/, ''); // Remove starting ``` block
      text = text.replace(/```$/, '');           // Remove ending ```
    }

    // Try parsing cleaned JSON
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse cleaned JSON from Gemini response:', text);
      throw new Error('Failed to parse JSON from Gemini model output');
    }

    res.json({
      success: true,
      parsedData
    });

  } catch (error) {
    console.error('Error parsing documents:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error parsing documents'
    });
  }
};

const getResult = async (req, res) => {
  try {
    const { context, prompt, output } = req.body;
    const result = await generateResult(context, prompt, output);
    res.json({ message: "Success", result });
  } catch (error) {
    console.error('Error in getResult:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  parseDocuments,
  getResult
};
