
---

# contributing.md

# Contributing to the Open Production Incident Dataset

Thank you for contributing.

This project collects **redacted real-world production error examples** to help engineers study incident patterns and improve reliability tooling.

This dataset is used to calibrate and evaluate the ExplainError incident classification engine.

---

# What Makes a Good Contribution

Useful examples include errors that:

• looked severe but were not  
• looked harmless but caused major incidents  
• triggered the wrong escalation path  
• were difficult to classify during triage  
• appeared misleading in logs or stack traces

Examples from the following environments are particularly helpful:

• cloud platforms (AWS / Azure / GCP)  
• microservices architectures  
• API gateways  
• payment systems  
• database infrastructure  
• authentication systems

---

# Required Redaction

All contributions must be **fully anonymised**.

Remove or replace:

• company names  
• internal service names  
• URLs  
• customer identifiers  
• account IDs  
• email addresses  
• API keys or tokens

Use placeholders such as:

<service> <internal-api> <user-id> <payment-gateway> <database-cluster> ``` ```

If the example cannot be safely redacted, please do not submit it.

---

# Example Submission

Example file path:

dataset/api-failures/payment-gateway-timeout.json

---

# File Naming Convention

Use descriptive file names.

Examples:

payment-gateway-timeout.json  
database-connection-exhaustion.json  
lambda-upstream-503.json

