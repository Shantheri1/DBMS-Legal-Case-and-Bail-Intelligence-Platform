# JurisPredict: Legal Case & Bail Intelligence Platform
**Department of Computer Science and Engineering | PES University**  
**Course:** DBMS Experiential Learning – Level 3 Project  
**Course Instructor:** Dr. Nagasundari S | **Section:** H  

---

## 👥 Team Details & Responsibilities

| Student Name | SRN | Primary Roles & Responsibilities |
| :--- | :--- | :--- |
| **Shantheni Shenoy** | `PES1UG24CS428` | Relational Database Design, ER Modeling, DDL Schema Implementation, SQL Triggers, Views, and Next.js Frontend Forms & Case Registry |
| **Shriranjini** | `PES1UG24CS447` | pgvector Vector Database Engine, Stored Procedures, ACID Transactions, Backend Next.js API Handlers, Complex SQL Analytics & Documentation |

---

## 📌 Project Overview & Beyond-CRUD Architecture

Over 75% of inmates across Indian correctional facilities are undertrials awaiting bail adjudication. The judicial process suffers from systemic bottlenecks: disparate physical records, manual precedent research, and non-standardized bail risk assessment.

**JurisPredict** goes far beyond basic CRUD operations by combining:
1. **Relational Core (PostgreSQL):** 15 normalized tables managing courts, judges, cases, accused persons, offences, law sections, and hearings with ACID transaction guarantees.
2. **Semantic Vector Search (pgvector):** Dense embedding vectors (384-dim) encoding Landmark Supreme Court rulings (e.g., *Satender Kumar Antil*, *Arnesh Kumar*, *Sanjay Chandra*), retrieving relevant precedents via cosine distance (`<=>`) matching advocate bail submissions.
3. **Automated Risk Engine (PL/pgSQL):** Stored procedure `fn_calculate_bail_risk_score` scoring bail petitions based on offence severity, criminal antecedents, and pre-trial detention duration.
4. **Active Database Triggers:** Prevents judicial hearing scheduling collisions within 45-minute windows and synchronizes case status upon bail adjudication.
5. **NoSQL Store (MongoDB):** Unstructured repository for raw FIR text, digital evidence logs, and forensic chain-of-custody records with aggregation pipelines.

---

## 🗄️ Relational Schema & Entities

The relational schema implements 15 tables directly formalized from the hand-drawn ER diagram:
1. `roles` (role_id, role_name, description)
2. `users` (user_id, role_id, name, email, password_hash, phone, status)
3. `courts` (court_id, court_name, court_type, location, address)
4. `judges` (judge_id, court_id, name, designation, email, status)
5. `persons` (person_id, name, gender, date_of_birth, address, phone, email)
6. `cases` (case_id, court_id, filed_by, case_number, title, filing_date, description, status, priority_level)
7. `case_parties` (case_id, person_id, party_role, is_active) - *Composite PK*
8. `offences` (offence_id, offence_name, description, bailable, severity_level)
9. `charges` (charge_id, case_id, offence_id, description)
10. `law_sections` (section_id, act_name, section_number, description, punishment_summary)
11. `charge_law_sections` (charge_id, section_id) - *Composite PK*
12. `bail_applications` (bail_id, case_id, applied_by, application_date, bail_type, grounds, status, risk_score, remarks)
13. `hearings` (hearing_id, case_id, judge_id, hearing_date, stage, outcome, next_hearing_date, remarks)
14. `bail_decisions` (decision_id, bail_id, judge_id, hearing_id, decision, decision_date, reasoning, conditions, surety_amount)
15. `documents` (document_id, case_id, uploaded_by, document_type, file_url, extracted_text, uploaded_at, description)
16. *Extension Table:* `judicial_precedents` (precedent_id, citation, court_level, ratio_decidendi, decision_outcome, embedding vector(384))

---

## 🚀 Execution & Setup Instructions

### 1. Database Setup (PostgreSQL with pgvector)
Ensure PostgreSQL 15+ is installed with `pgvector`:
```bash
# Connect to your PostgreSQL instance
psql -U postgres

# Create database
CREATE DATABASE jurispredict_db;
\c jurispredict_db;

# Run schema, features, and seed scripts
\i database/01_schema.sql
\i database/02_advanced_features.sql
\i database/03_seed_data.sql
```

### 2. Run Queries & Verify Features
Execute the advanced analytical queries:
```bash
\i database/04_complex_queries.sql
```

### 3. Web Application Setup (Next.js)
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run the Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔬 Advanced Database Features Summary

1. **ACID Transaction:** Procedure `sp_atomic_case_filing_transaction` executing atomic case registration, accused linkage, charge framing, and preliminary hearing with `SAVEPOINT` rollback.
2. **Views:**
   - `vw_bail_intelligence_summary`: Joins cases, accused, offences, law sections, and bail risk.
   - `vw_judge_caseload_metrics`: Calculates hearing counts and bail grant percentages per judge.
   - `vw_case_full_dossier`: Full case status overview.
3. **Stored Functions / Procedures:**
   - `fn_calculate_bail_risk_score(case_id, bail_id)`: Weighted criminal scoring algorithm.
   - `sp_adjudicate_bail(...)`: Atomically records bail orders and updates case state.
4. **Active Database Triggers:**
   - `trg_prevent_judge_conflict`: Prevents judge double-booking within 45 minutes.
   - `trg_sync_case_status`: Automatically sets case status to `BAIL_GRANTED` or `BAIL_REJECTED`.
   - `trg_auto_compute_risk`: Automatically triggers scoring upon bail petition submission.
5. **Vector Similarity Search:**
   - `fn_semantic_precedent_search`: HNSW indexed cosine similarity search over legal rulings.
