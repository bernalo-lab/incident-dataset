require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const IncidentSubmission = require("./models/IncidentSubmission");

const app = express();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/docs", express.static(path.join(__dirname, "docs")));

function requireBasicAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin Area"');
    return res.status(401).send("Authentication required.");
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("utf8");
  const [username, password] = credentials.split(":");

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin Area"');
    return res.status(401).send("Invalid credentials.");
  }

  next();
}

app.get("/", (req, res) => {
  res.redirect("/submit");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/submit", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Submit Incident Example</title>
      <style>
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #0b1020;
          color: #e7ecf7;
        }
        .container {
          width: min(820px, 92%);
          margin: 40px auto;
        }
        h1 {
          margin-bottom: 10px;
        }
        p {
          color: #b0bbd1;
        }
        form {
          background: #121933;
          border: 1px solid #263252;
          border-radius: 16px;
          padding: 24px;
        }
        label {
          display: block;
          margin-top: 18px;
          margin-bottom: 8px;
          font-weight: bold;
        }
        input, select, textarea {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #263252;
          background: #0f1530;
          color: #e7ecf7;
          box-sizing: border-box;
        }
        textarea {
          min-height: 110px;
          resize: vertical;
        }
        .checkbox-row {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          margin-top: 18px;
        }
        .checkbox-row input {
          width: auto;
          margin-top: 4px;
        }
        button {
          margin-top: 22px;
          background: #4f7cff;
          color: white;
          border: 0;
          border-radius: 10px;
          padding: 12px 18px;
          font-weight: bold;
          cursor: pointer;
        }
        .note {
          margin-top: 10px;
          font-size: 0.95rem;
          color: #9db0d6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Submit a Redacted Incident Example</h1>
        <p>
          Share a production incident example to help grow the Open Production Incident Dataset.
          Please ensure all submitted information is fully redacted.
        </p>

        <form method="POST" action="/api/incident-submit">
          <label for="category">Category</label>
          <select id="category" name="category" required>
            <option value="">Select category</option>
            <option value="api-failures">API Failures</option>
            <option value="database-errors">Database Errors</option>
            <option value="payment-errors">Payment Errors</option>
            <option value="timeout-patterns">Timeout Patterns</option>
            <option value="authentication-errors">Authentication Errors</option>
            <option value="dependency-failures">Dependency Failures</option>
            <option value="configuration-errors">Configuration Errors</option>
            <option value="cascading-failures">Cascading Failures</option>
            <option value="retry-amplification">Retry Amplification</option>
            <option value="partial-failures">Partial Failures</option>
            <option value="insurance-workflow-failures">Insurance Workflow Failures</option>
            <option value="enterprise-dependency-errors">Enterprise Dependency Errors</option>
            <option value="queue-backlogs">Queue Backlogs</option>
            <option value="latency-spikes">Latency Spikes</option>
            <option value="security-signature-errors">Security Signature Errors</option>
          </select>

          <label for="environment">Environment</label>
          <input id="environment" name="environment" type="text" placeholder="production" required />

          <label for="service">Service</label>
          <input id="service" name="service" type="text" placeholder="<checkout-service>" />

          <label for="error_message">Error Message</label>
          <textarea id="error_message" name="error_message" required></textarea>

          <label for="log_excerpt">Log Excerpt</label>
          <textarea id="log_excerpt" name="log_excerpt" required></textarea>

          <label for="observed_symptoms">Observed Symptoms (one per line)</label>
          <textarea id="observed_symptoms" name="observed_symptoms" required></textarea>

          <label for="triage_notes">Triage Notes</label>
          <textarea id="triage_notes" name="triage_notes" required></textarea>

          <label for="expected_classification">Expected Classification</label>
          <input id="expected_classification" name="expected_classification" type="text" placeholder="dependency/unavailable" />

          <label for="expected_severity">Expected Severity</label>
          <select id="expected_severity" name="expected_severity">
            <option value="">Select severity</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>

          <label for="confidence_hints">Confidence Hints (one per line)</label>
          <textarea id="confidence_hints" name="confidence_hints"></textarea>

          <label for="action_signal">Action Signal</label>
          <input id="action_signal" name="action_signal" type="text" placeholder="retry_or_failover" />

          <div class="checkbox-row">
            <input id="redaction_confirmed" name="redaction_confirmed" type="checkbox" required />
            <label for="redaction_confirmed" style="margin: 0; font-weight: normal;">
              I confirm this submission is fully redacted and contains no sensitive information.
            </label>
          </div>

          <button type="submit">Submit Incident</button>
          <p class="note">Submissions are stored for review before being added to the public dataset.</p>
        </form>
      </div>
    </body>
    </html>
  `);
});

app.post("/api/incident-submit", async (req, res) => {
  try {
    const {
      category,
      environment,
      service,
      error_message,
      log_excerpt,
      observed_symptoms,
      triage_notes,
      expected_classification,
      expected_severity,
      confidence_hints,
      action_signal,
      redaction_confirmed
    } = req.body;

    if (!category || !environment || !error_message || !log_excerpt || !observed_symptoms || !triage_notes) {
      return res.status(400).json({
        error: "Missing required fields."
      });
    }

    if (!redaction_confirmed) {
      return res.status(400).json({
        error: "Redaction confirmation is required."
      });
    }

    const submission = new IncidentSubmission({
      id: `INC-${Date.now()}`,
      category,
      environment,
      service,
      error_message,
      log_excerpt,
      observed_symptoms: String(observed_symptoms)
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      triage_notes,
      expected_classification,
      expected_severity,
      confidence_hints: String(confidence_hints || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      action_signal,
      redaction_confirmed: true,
      status: "pending"
    });

    await submission.save();

    return res.status(201).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Submission Received</title>
        <style>
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #0b1020;
            color: #e7ecf7;
            display: grid;
            place-items: center;
            min-height: 100vh;
          }
          .box {
            width: min(640px, 92%);
            background: #121933;
            border: 1px solid #263252;
            border-radius: 16px;
            padding: 28px;
            text-align: center;
          }
          a {
            color: #7aa2ff;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>Incident Submitted</h1>
          <p>Thank you. Your redacted incident example has been received for review.</p>
          <p><a href="/submit">Submit another example</a></p>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Submission error:", error);
    return res.status(500).json({
      error: "Internal server error."
    });
  }
});

app.get("/admin/incidents", requireBasicAuth, async (req, res) => {
  try {
    const incidents = await IncidentSubmission.find().sort({ createdAt: -1 }).lean();

    const rows = incidents.map((incident) => {
      return `
        <tr>
          <td>${incident.id}</td>
          <td>${incident.category || ""}</td>
          <td>${incident.environment || ""}</td>
          <td>${incident.status || ""}</td>
          <td>${incident.expected_severity || ""}</td>
          <td>${incident.createdAt ? new Date(incident.createdAt).toLocaleString() : ""}</td>
          <td>
            ${
              incident.status === "pending"
                ? `
                  <form method="POST" action="/admin/approve/${incident.id}" style="display:inline-block; margin-right:8px;">
                    <button type="submit" style="background:#1f9d55;color:#fff;border:0;border-radius:8px;padding:8px 12px;cursor:pointer;">
                      Approve
                    </button>
                  </form>
                  <form method="POST" action="/admin/reject/${incident.id}" style="display:inline-block;">
                    <button type="submit" style="background:#c53030;color:#fff;border:0;border-radius:8px;padding:8px 12px;cursor:pointer;">
                      Reject
                    </button>
                  </form>
                `
                : incident.status === "approved"
                  ? `<span style="color:#68d391;font-weight:bold;">Approved</span>`
                  : `<span style="color:#fc8181;font-weight:bold;">Rejected</span>`
            }
          </td>
        </tr>
      `;
    }).join("");

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Admin Incidents</title>
        <style>
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #0b1020;
            color: #e7ecf7;
          }
          .container {
            width: min(1100px, 94%);
            margin: 32px auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: #121933;
            border: 1px solid #263252;
          }
          th, td {
            padding: 12px;
            border-bottom: 1px solid #263252;
            text-align: left;
            vertical-align: top;
          }
          th {
            background: #0f1530;
          }
          h1 {
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Incident Submissions</h1>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Environment</th>
                <th>Status</th>
                <th>Severity</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rows || `<tr><td colspan="7">No submissions found.</td></tr>`}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Admin fetch error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/admin/approve/:id", requireBasicAuth, async (req, res) => {
  try {
    await IncidentSubmission.findOneAndUpdate(
      { id: req.params.id },
      {
        status: "approved",
        reviewed_at: new Date()
      }
    );

    res.redirect("/admin/incidents");
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/admin/reject/:id", requireBasicAuth, async (req, res) => {
  try {
    await IncidentSubmission.findOneAndUpdate(
      { id: req.params.id },
      {
        status: "rejected",
        reviewed_at: new Date()
      }
    );

    res.redirect("/admin/incidents");
  } catch (error) {
    console.error("Reject error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.get("/dataset/public", async (req, res) => {
  try {
    const incidents = await IncidentSubmission.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .lean();

    const publicDataset = incidents.map((incident) => ({
      id: incident.id,
      category: incident.category,
      environment: incident.environment,
      service: incident.service,
      error_message: incident.error_message,
      log_excerpt: incident.log_excerpt,
      observed_symptoms: incident.observed_symptoms,
      triage_notes: incident.triage_notes,
      expected_classification: incident.expected_classification,
      expected_severity: incident.expected_severity,
      confidence_hints: incident.confidence_hints,
      action_signal: incident.action_signal,
      reviewed_at: incident.reviewed_at,
      createdAt: incident.createdAt
    }));

    res.json({
      dataset_name: "ExplainError Calibration Dataset",
      total_approved: publicDataset.length,
      incidents: publicDataset
    });
  } catch (error) {
    console.error("Public dataset error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/dataset", async (req, res) => {
  try {
    const incidents = await IncidentSubmission.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .lean();

    const totalIncidents = incidents.length;

    const severityCounts = {};
    const categoryCounts = {};
    const actionCounts = {};

    incidents.forEach((i) => {
      severityCounts[i.expected_severity] =
        (severityCounts[i.expected_severity] || 0) + 1;

      categoryCounts[i.category] =
        (categoryCounts[i.category] || 0) + 1;

      actionCounts[i.action_signal] =
        (actionCounts[i.action_signal] || 0) + 1;
    });

    const categoryList = Object.entries(categoryCounts)
      .map(([k, v]) => `<li>${k}: ${v}</li>`)
      .join("");

    const severityList = Object.entries(severityCounts)
      .map(([k, v]) => `<li>${k}: ${v}</li>`)
      .join("");

    const actionList = Object.entries(actionCounts)
      .map(([k, v]) => `<li>${k}: ${v}</li>`)
      .join("");

    const rows = incidents.map((i) => `
      <tr>
        <td>${i.id}</td>
        <td>${i.category}</td>
        <td>${i.environment}</td>
        <td>${i.expected_classification}</td>
        <td>${i.expected_severity}</td>
        <td>${i.action_signal}</td>
        <td>${new Date(i.createdAt).toLocaleString()}</td>
      </tr>
    `).join("");

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ExplainError Incident Dataset</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: #020617;
            color: white;
            margin: 0;
            padding: 40px 24px;
          }
          .page {
            max-width: 1240px;
            margin: 0 auto;
          }
          h1 {
            font-size: 3rem;
            margin: 0 0 14px;
            line-height: 1.05;
          }
          h2 {
            margin: 0 0 18px;
            font-size: 1.7rem;
          }
          p {
            color: #cbd5e1;
            line-height: 1.6;
          }
          a {
            color: #60a5fa;
          }
          a.button {
            display: inline-block;
            margin-top: 10px;
            padding: 12px 18px;
            background: #2563eb;
            color: white;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
          }
          .hero {
            margin-bottom: 36px;
          }
          .intro-copy {
            max-width: 760px;
          }
          .flow-section {
            margin: 40px 0;
            padding: 24px;
            background: #071127;
            border: 1px solid #1e293b;
            border-radius: 16px;
          }
          .flow-section p.section-note {
            margin-top: 0;
            margin-bottom: 20px;
          }
          .flow-container {
            display: flex;
            align-items: stretch;
            flex-wrap: wrap;
            gap: 16px;
          }
          .flow-box {
            background: #0f172a;
            border: 1px solid #1e293b;
            padding: 18px;
            border-radius: 12px;
            width: 200px;
            box-sizing: border-box;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.18);
          }
          .flow-box h3 {
            margin: 0 0 8px;
            font-size: 16px;
          }
          .flow-box p {
            margin: 0;
            font-size: 13px;
            color: #cbd5f5;
          }
          .flow-arrow {
            font-size: 24px;
            color: #60a5fa;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 20px;
          }
          .metrics {
            margin: 30px 0 40px;
            display: flex;
            gap: 24px;
            flex-wrap: wrap;
          }
          .metric-card {
            min-width: 220px;
            background: #071127;
            border: 1px solid #1e293b;
            border-radius: 14px;
            padding: 18px;
            box-sizing: border-box;
          }
          .metric-card h3 {
            margin-bottom: 10px;
          }
          .metric-card p {
            font-size: 28px;
            margin: 0;
            color: white;
          }
          .metric-card ul {
            margin: 0;
            padding-left: 18px;
            color: #cbd5e1;
          }
          .table-wrap {
            overflow-x: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            min-width: 860px;
          }
          th, td {
            border: 1px solid #1e293b;
            padding: 12px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background: #0f172a;
          }
          td {
            background: #020617;
          }
          @media (max-width: 900px) {
            h1 {
              font-size: 2.2rem;
            }
            .flow-arrow {
              transform: rotate(90deg);
              width: 100%;
              min-width: 100%;
              min-height: 20px;
            }
            .flow-box {
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="hero">
            <h1>ExplainError Calibration Dataset</h1>
            <p style="color:#9db0d6;">Dataset Version: 0.2</p>
            <p class="intro-copy">Approved community incidents used to calibrate ExplainError classification, severity judgement, and operational action signals.</p>
            <p>
              API access:
              <a href="/dataset/public">/dataset/public</a>
            </p>

            <a href="/submit" class="button">Submit a Redacted Incident</a>
          </div>

          <div class="flow-section">
            <h2>How ExplainError Interprets Incidents</h2>
            <p class="section-note">This dataset is designed to show how messy production signals are transformed into structured judgement that engineers can act on quickly.</p>

            <div class="flow-container">
              <div class="flow-box">
                <h3>Raw Incident</h3>
                <p>Error message, logs, symptoms and triage notes from live production systems.</p>
              </div>

              <div class="flow-arrow">→</div>

              <div class="flow-box">
                <h3>Pattern Detection</h3>
                <p>Signals are matched against known failure shapes such as timeouts, dependency failures, backlog conditions and workflow stalls.</p>
              </div>

              <div class="flow-arrow">→</div>

              <div class="flow-box">
                <h3>Classification</h3>
                <p>A structured incident type is assigned, such as <strong>dependency/unavailable</strong> or <strong>workflow/stalled</strong>.</p>
              </div>

              <div class="flow-arrow">→</div>

              <div class="flow-box">
                <h3>Confidence</h3>
                <p>The judgement is scored according to signal strength, ambiguity and pattern match quality.</p>
              </div>

              <div class="flow-arrow">→</div>

              <div class="flow-box">
                <h3>Action Signal</h3>
                <p>Operational guidance is surfaced, such as <strong>retry_or_failover</strong>, <strong>escalate</strong> or <strong>manual_review</strong>.</p>
              </div>
            </div>
          </div>

          <div class="metrics">
            <div class="metric-card">
              <h3>Total Incident Patterns</h3>
              <p>${totalIncidents}</p>
            </div>

            <div class="metric-card">
              <h3>Categories</h3>
              <ul>${categoryList || "<li>No categories yet.</li>"}</ul>
            </div>

            <div class="metric-card">
              <h3>Severity Distribution</h3>
              <ul>${severityList || "<li>No severities yet.</li>"}</ul>
            </div>

            <div class="metric-card">
              <h3>Action Signals</h3>
              <ul>${actionList || "<li>No action signals yet.</li>"}</ul>
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Environment</th>
                  <th>Classification</th>
                  <th>Severity</th>
                  <th>Action Signal</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                ${rows || `<tr><td colspan="7">No approved incidents yet.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal error");
  }
});

async function startServer() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not set.");
    }

    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
    process.exit(1);
  }
}

startServer();
