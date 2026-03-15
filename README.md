# Open Production Incident Dataset

A curated dataset of **real-world production errors and incident signals** used to study failure patterns, improve incident triage, and calibrate error classification systems.

Modern distributed systems produce **large volumes of noisy errors**.  
During an incident, engineers must quickly answer questions such as:

• Is this a dependency failure?  
• Is this transient or systemic?  
• Should we retry or escalate?  
• Is the application actually broken?

Unfortunately, error messages rarely provide clear answers.

This repository collects **redacted real-world incident examples** to help engineers and tools better understand and classify production failures.

⭐ If you find this repository useful, please consider starring it.

---

# Purpose

This dataset exists to:

• document real-world incident patterns  
• improve reliability engineering knowledge  
• calibrate error classification systems  
• support research into automated incident triage

The examples here represent **situations engineers regularly encounter during incidents**, including misleading errors and ambiguous failure signals.

---

# Example Categories

The dataset includes examples such as:

api-failures/
payment-errors/
timeout-patterns/
dependency-failures/
database-errors/
authentication-errors/

These categories reflect common sources of production incidents in distributed systems.

---

# Repository Structure

incident-dataset/

README.md  
contributing.md  

dataset/

  api-failures/  
  payment-errors/  
  timeout-patterns/  
  dependency-failures/  
  database-errors/  
  authentication-errors/  

examples/

  example.json

---

# Example Dataset Entry

Each example follows a structured format.

See
1. template example - examples/example.json
2. actual example - api-failures/api-failures.json

This structure allows the dataset to be used for:

• incident pattern analysis
• error classification testing
• reliability engineering research
• automated incident tooling

---

# Data Redaction Policy

All submissions must remove sensitive information.

Replace identifiable values with placeholders such as:

<service-name>
<user-id>
<payment-gateway>
<internal-api>
<database-cluster>

Never include:

• company names
• internal URLs
• customer identifiers
• secrets or tokens

Only submit fully redacted examples.

---

# Related Project

This dataset is used to calibrate ExplainError.

ExplainError is a lightweight enrichment layer that converts raw error signals into structured judgement signals during incident triage.

It provides:

• classification
• severity assessment
• confidence scoring
• structured evidence signals
• suggested action bias

---

# Learn more:

https://bernalo-lab.github.io/explain-error/

---

# Why This Dataset Matters

During incidents, engineers often lose valuable time trying to determine what an error actually means.

The goal of this dataset is to capture the kinds of misleading errors engineers encounter in real production systems, and make those patterns easier to study and recognise.

Over time, this repository aims to become a reference dataset for production incident patterns.

---

# Contributing

Contributions are welcome.

If you have encountered a misleading, confusing, or difficult production error, consider submitting a redacted example.

Please read:

 **contributing.md**

before submitting.

---

# License

This dataset is provided for educational and research purposes.

All submissions must be fully anonymised and redacted.

---

# Dataset Format

Each example should be submitted as a JSON file using the following structure.
See json file examples -

{
  "id": "API-503-001",
  "category": "api-failures",
  "environment": "production",
  "error_message": "503 Service Unavailable returned by upstream API",
  "observed_symptoms": [
    "retry storms",
    "checkout failures"
  ],
  "expected_classification": "dependency/unavailable",
  "expected_severity": "high",
  "triage_notes": "Upstream payment gateway unavailable.",
  "action_signal": "retry_or_failover"
}

1. Submission Process

2. Fork the repository

3. Create a new JSON file inside the appropriate category folder:
   For example:
     dataset/api-failures/
     dataset/payment-errors/
     dataset/timeout-patterns/

4. Add your example
   Example file path: dataset/api-failures/api-failures.json

5. Submit a Pull Request

---

# Example Contribution Ideas

Examples that are especially valuable include:

• retry storms caused by dependency timeouts
• misleading stack traces
• cascading failures across services
• database connection pool exhaustion
• API gateway errors masking upstream failures
• authentication token expiry issues
• partial payload or malformed response errors

---

# Code of Conduct

Contributors are expected to:

• share responsibly
• protect confidential information
• maintain professional conduct

This repository is intended for educational and engineering collaboration purposes.

---

# Thank You

By contributing, you are helping improve the reliability engineering community’s understanding of real-world production failures.

---

If you'd like, I can also give you **the 5 starter dataset examples** you should include immediately so the repository doesn't look empty when you launch it.
