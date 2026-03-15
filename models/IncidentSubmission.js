const mongoose = require("mongoose");

const IncidentSubmissionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    environment: {
      type: String,
      required: true,
      trim: true
    },
    service: {
      type: String,
      trim: true,
      default: ""
    },
    error_message: {
      type: String,
      required: true,
      trim: true
    },
    log_excerpt: {
      type: String,
      required: true,
      trim: true
    },
    observed_symptoms: {
      type: [String],
      required: true,
      default: []
    },
    triage_notes: {
      type: String,
      required: true,
      trim: true
    },
    expected_classification: {
      type: String,
      trim: true,
      default: ""
    },
    expected_severity: {
      type: String,
      enum: ["", "low", "medium", "high", "critical"],
      default: ""
    },
    confidence_hints: {
      type: [String],
      default: []
    },
    action_signal: {
      type: String,
      trim: true,
      default: ""
    },
    redaction_confirmed: {
      type: Boolean,
      required: true,
      default: false
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    review_notes: {
      type: String,
      trim: true,
      default: ""
    },
    reviewed_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("IncidentSubmission", IncidentSubmissionSchema);
