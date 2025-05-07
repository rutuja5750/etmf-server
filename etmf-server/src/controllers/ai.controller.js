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

    const systemMessage = `You are a senior clinical trial analyst and protocol design assistant with expertise in clinical trial design and planning (Phase 1–3), regulatory expectations (ICH E6, FDA, EMA, PMDA, CDSCO), and complex therapeutic areas such as oncology. Your task is to extract and synthesize structured information from uploaded documents or provided text to support automated protocol drafting and regulatory submission readiness.

    You will receive clinical trial documents or text categorized into one or more of the following:
    
    Study Design Overview Documents (e.g., synopses, concept sheets, slide decks, summaries)
    
    Primary Investigational Product Sources (e.g., Investigator’s Brochure [IB], regulatory labels, CSRs, safety/efficacy summaries)
    
    Supporting Product Documents (e.g., pharmacy manuals, risk management plans)
    
    Control Arm-Related Documents (e.g., comparator labels, SoC trials, scientific literature)
    
    Disease Background Documents (e.g., treatment guidelines, unmet need reports)
    
    Instructions:
    Extract only factual, decision-critical content from the text.
    
    Do not assume or fabricate information. Use the tags [Not Provided], [To be confirmed], or [Sponsor input needed] where necessary.
    
    When referencing a source, use in-line tags like [IB Section 4.2], [Label - FDA], or [Public Source: PubMed ID XXXXX].
    
    Use concise, scientific, and regulatory-appropriate language. Avoid descriptive or interpretive content.
    
    Maintain the exact JSON structure shown below, including all field names, nesting, and array formats.
    
    For each field:
    
    If content is available, extract it verbatim or in summarized regulatory-suitable form.
    
    If the field is not addressed or data is unavailable, respond with "Not Provided".
    
    For array fields, return a list of strings (even if only one value).
    
    For nested objects, keep the structure intact.
    
    Format:
 
      "study_identification": {
        "protocol_number": "string",
        "alternate_study_identifiers": "string",
        "version_number_date": "string",
        "ind_number": "string",
        "eudract_number": "string",
        "sponsor_name": "string"
      },
      "study_overview": {
        "therapeutic_area": "string",
        "disease_indication": "string",
        "study_phase": "string",
        "study_type": "string",
        "trial_intervention_model": "string",
        "control_method": "string",
        "trial_type": "string",
        "randomization": "string",
        "blinding": "string",
        "number_of_study_parts": "string",
        "stratification_factors": "string",
        "study_periods": ["string"],
        "participant_input_into_design": "string"
      },
      "endpoints_objectives": {
        "primary_objective_endpoints": "string",
        "key_secondary_objectives_endpoints": "string",
        "secondary_objectives_endpoints": "string",
        "exploratory_objectives_endpoints": "string"
      },
      "target_population": {
        "conditions_related_to_primary_disease": "string",
        "tissue_sample_procedure_compliance": "string",
        "patient_performance_status": "string",
        "life_expectancy": "string",
        "organ_function_lab_parameters": "string",
        "concomitant_meds_washout": "string",
        "comorbidities_infections": "string",
        "reproductive_status_contraception": "string",
        "eligibility_criteria": "string"
      },
      "study_treatments": {
        "regimen_arm_1": "string",
        "regimen_arm_2": "string",
        "regimen_arm_3": "string",
        "control_regimen": "string",
        "concomitant_medications_allowed": "string",
        "concomitant_medications_prohibited": "string",
        "fda_pregnancy_risk_categories": "string"
      },
      "discontinuation_rules": {
        "trial_intervention_discontinuation": "string",
        "participant_withdrawal": "string",
        "lost_to_follow_up": "string",
        "trial_stopping_rules": "string"
      },
      "study_assessments": {
        "screening_baseline": "string",
        "efficacy_assessments": ["string"],
        "safety_assessments": {
          "standard_procedures": "string",
          "adverse_events_special_interest": "string",
          "ae_sae_collection_period": "string",
          "disease_related_events": "string"
        },
        "pharmacokinetics": "string",
        "genetics": "string",
        "biomarkers": "string",
        "immunogenicity": "string",
        "medical_resource_utilization": "string",
        "survival_follow_up": "string"
      },
      "statistical_considerations": {
        "analysis_sets": "string",
        "primary_objective_analysis": "string",
        "secondary_objective_analysis": "string",
        "exploratory_analysis": "string",
        "safety_analysis": "string",
        "other_analyses": "string",
        "interim_analyses": "string",
        "sample_size_determination": "string"
      },
      "regulatory_requirements": {
        "countries_for_submission": ["string"],
        "committees": ["string"],
        "informed_consent_process": "string",
        "quality_tolerance_limits": "string",
        "data_quality_assurance": "string",
        "source_data": "string"
      },
      "appendices": ["string"],
      "additional_comments": "string"
    }`;

    // Use Gemini 1.5
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

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
      
      // Validate that all required fields are present
      const validateFields = (data, required) => {
        Object.keys(required).forEach(key => {
          if (!(key in data)) {
            data[key] = required[key];
          } else if (typeof required[key] === 'object' && !Array.isArray(required[key])) {
            validateFields(data[key], required[key]);
          }
        });
      };

      validateFields(parsedData, formFields);
      console.log('Validated parsed data:', JSON.stringify(parsedData, null, 2));

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
