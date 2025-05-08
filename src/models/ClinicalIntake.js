const mongoose = require('mongoose');

const clinicalIntakeSchema = new mongoose.Schema({
  // Document Upload Section
  documents: [{
    type: String,
    name: String,
    uploadedAt: Date
  }],

  // Background Information
  background_information: {
    disease_epidemiology: String,
    current_standard_of_care: String,
    outcomes_current_soc: String,
    benefits_investigational: String,
    risks_investigational: String
  },

  // Study Identification
  study_identification: {
    protocol_number: String,
    alternate_study_identifiers: String,
    version_number_date: String,
    ind_number: String,
    eudract_number: String,
    sponsor_name: String
  },

  // Study Overview
  study_overview: {
    therapeutic_area: String,
    disease_indication: String,
    study_phase: String,
    study_type: String,
    trial_intervention_model: String,
    control_method: String,
    trial_type: String,
    randomization: String,
    blinding: String,
    number_of_study_parts: String,
    stratification_factors: String,
    study_periods: [String],
    participant_input_into_design: String
  },

  // Endpoints and Objectives
  endpoints_objectives: {
    primary_objective_endpoints: String,
    key_secondary_objectives_endpoints: String,
    secondary_objectives_endpoints: String,
    exploratory_objectives_endpoints: String
  },

  // Target Population
  target_population: {
    conditions_related_to_primary_disease: String,
    tissue_sample_procedure_compliance: String,
    patient_performance_status: String,
    life_expectancy: String,
    organ_function_lab_parameters: String,
    concomitant_meds_washout: String,
    comorbidities_infections: String,
    reproductive_status_contraception: String,
    eligibility_criteria: String
  },

  // Study Treatments
  study_treatments: {
    regimen_arm_1: String,
    regimen_arm_2: String,
    regimen_arm_3: String,
    control_regimen: String,
    concomitant_medications_allowed: String,
    concomitant_medications_prohibited: String,
    fda_pregnancy_risk_categories: String
  },

  // Discontinuation Rules
  discontinuation_rules: {
    trial_intervention_discontinuation: String,
    participant_withdrawal: String,
    lost_to_follow_up: String,
    trial_stopping_rules: String
  },

  // Study Assessments
  study_assessments: {
    screening_baseline: String,
    efficacy_assessments: [String],
    safety_assessments: {
      standard_procedures: String,
      adverse_events_special_interest: String,
      ae_sae_collection_period: String,
      disease_related_events: String
    },
    pharmacokinetics: String,
    genetics: String,
    biomarkers: String,
    immunogenicity: String,
    medical_resource_utilization: String,
    survival_follow_up: String
  },

  // Statistical Considerations
  statistical_considerations: {
    analysis_sets: String,
    primary_objective_analysis: String,
    secondary_objective_analysis: String,
    exploratory_analysis: String,
    safety_analysis: String,
    other_analyses: String,
    interim_analyses: String,
    sample_size_determination: String
  },

  // Regulatory Requirements
  regulatory_requirements: {
    countries_for_submission: [String],
    committees: [String],
    informed_consent_process: String,
    quality_tolerance_limits: String,
    data_quality_assurance: String,
    source_data: String
  },

  // Appendices
  appendices: [String],

  // Additional Comments
  additional_comments: String,

  // Document Uploads
  document_uploads: {
    primary_documents: {
      investigator_brochure: Boolean,
      label: Boolean,
      additional_reports: Boolean
    },
    supporting_documents: {
      pharmacy_manual: Boolean,
      risk_management_guidelines: Boolean,
      user_defined: Boolean
    },
    study_design_outline: Boolean,
    control_arm_documents: Boolean,
    disease_background_documents: Boolean,
    uploaded_files: {
      investigator_brochure: [{
        name: String,
        filename: String,
        documentType: String
      }],
      label: [{
        name: String,
        filename: String,
        documentType: String
      }],
      additional_reports: [{
        name: String,
        filename: String,
        documentType: String
      }],
      pharmacy_manual: [{
        name: String,
        filename: String,
        documentType: String
      }],
      risk_management_guidelines: [{
        name: String,
        filename: String,
        documentType: String
      }],
      user_defined: [{
        name: String,
        filename: String,
        documentType: String
      }],
      study_design_outline: [{
        name: String,
        filename: String,
        documentType: String
      }],
      control_arm_documents: [{
        name: String,
        filename: String,
        documentType: String
      }],
      disease_background_documents: [{
        name: String,
        filename: String,
        documentType: String
      }]
    }
  },

  // Study Monitoring and Logistics
  study_monitoring_logistics: {
    data_collection_method: String,
    monitoring_frequency: String,
    on_site_or_remote: String,
    key_contacts: {
      sponsor_contact: String,
      cro_contact: String
    }
  },

  // Metadata
  submittedAt: {
    type: Date,
    default: Date.now
  },
  submittedBy: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ClinicalIntake', clinicalIntakeSchema); 