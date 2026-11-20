-- ==============================================================================
-- PROJECT: JURISPREDICT - LEGAL CASE & BAIL INTELLIGENCE SYSTEM
-- DEPARTMENT: Computer Science and Engineering | DBMS Experiential Learning - Level 3
-- AUTHORS: Shantheni Shenoy (PES1UG24CS428) & Shriranjini (PES1UG24CS447)
-- SECTION: H | INSTRUCTOR: Dr. Nagasundari S
-- DATABASE: PostgreSQL (Relational Core + pgvector Semantic Intelligence)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. EXTENSIONS & CLEANUP (DDL: DROP)
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop views if existing
DROP VIEW IF EXISTS vw_bail_intelligence_summary CASCADE;
DROP VIEW IF EXISTS vw_judge_caseload_metrics CASCADE;
DROP VIEW IF EXISTS vw_case_full_dossier CASCADE;

-- Drop tables in reverse topological order (respecting foreign keys)
DROP TABLE IF EXISTS judicial_precedents CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS bail_decisions CASCADE;
DROP TABLE IF EXISTS hearings CASCADE;
DROP TABLE IF EXISTS bail_applications CASCADE;
DROP TABLE IF EXISTS charge_law_sections CASCADE;
DROP TABLE IF EXISTS law_sections CASCADE;
DROP TABLE IF EXISTS charges CASCADE;
DROP TABLE IF EXISTS offences CASCADE;
DROP TABLE IF EXISTS case_parties CASCADE;
DROP TABLE IF EXISTS persons CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS judges CASCADE;
DROP TABLE IF EXISTS courts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ------------------------------------------------------------------------------
-- 1. ROLES & USERS (Authentication & Role-Based Access Control)
-- ------------------------------------------------------------------------------
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES roles(role_id) ON DELETE RESTRICT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' 
        CONSTRAINT chk_user_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. COURTS & JUDGES (Judicial Administration Hierarchy)
-- ------------------------------------------------------------------------------
CREATE TABLE courts (
    court_id SERIAL PRIMARY KEY,
    court_name VARCHAR(150) NOT NULL,
    court_type VARCHAR(50) NOT NULL 
        CONSTRAINT chk_court_type CHECK (court_type IN ('SUPREME_COURT', 'HIGH_COURT', 'DISTRICT_COURT', 'SESSIONS_COURT', 'MAGISTRATE_COURT')),
    location VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE judges (
    judge_id SERIAL PRIMARY KEY,
    court_id INT NOT NULL REFERENCES courts(court_id) ON DELETE RESTRICT,
    name VARCHAR(120) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' 
        CONSTRAINT chk_judge_status CHECK (status IN ('ACTIVE', 'ON_LEAVE', 'RETIRED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. PERSONS (Citizens, Accused, Petitioners, Victims, Witnesses)
-- ------------------------------------------------------------------------------
CREATE TABLE persons (
    person_id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    gender VARCHAR(20) 
        CONSTRAINT chk_gender CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    date_of_birth DATE NOT NULL 
        CONSTRAINT chk_dob_past CHECK (date_of_birth < CURRENT_DATE),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 4. CASES & CASE PARTIES
-- ------------------------------------------------------------------------------
CREATE TABLE cases (
    case_id SERIAL PRIMARY KEY,
    court_id INT NOT NULL REFERENCES courts(court_id) ON DELETE RESTRICT,
    filed_by INT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    case_number VARCHAR(60) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    filing_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    status VARCHAR(35) NOT NULL DEFAULT 'FILED' 
        CONSTRAINT chk_case_status CHECK (status IN (
            'FILED', 'UNDER_INVESTIGATION', 'HEARING_IN_PROGRESS', 
            'BAIL_PENDING', 'BAIL_GRANTED', 'BAIL_REJECTED', 
            'DISPOSED', 'APPEALED'
        )),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE case_parties (
    case_id INT NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    person_id INT NOT NULL REFERENCES persons(person_id) ON DELETE RESTRICT,
    party_role VARCHAR(50) NOT NULL 
        CONSTRAINT chk_party_role CHECK (party_role IN ('ACCUSED', 'PETITIONER', 'RESPONDENT', 'VICTIM', 'WITNESS', 'SURETY')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (case_id, person_id)
);

-- ------------------------------------------------------------------------------
-- 5. OFFENCES, CHARGES & LAW SECTIONS
-- ------------------------------------------------------------------------------
CREATE TABLE offences (
    offence_id SERIAL PRIMARY KEY,
    offence_name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    bailable BOOLEAN NOT NULL DEFAULT FALSE,
    severity_level VARCHAR(20) DEFAULT 'MODERATE' 
        CONSTRAINT chk_severity CHECK (severity_level IN ('MINOR', 'MODERATE', 'HEINOUS', 'CRITICAL'))
);

CREATE TABLE charges (
    charge_id SERIAL PRIMARY KEY,
    case_id INT NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    offence_id INT NOT NULL REFERENCES offences(offence_id) ON DELETE RESTRICT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE law_sections (
    section_id SERIAL PRIMARY KEY,
    act_name VARCHAR(120) NOT NULL,
    section_number VARCHAR(50) NOT NULL,
    description TEXT,
    punishment_summary TEXT,
    CONSTRAINT uq_act_section UNIQUE (act_name, section_number)
);

CREATE TABLE charge_law_sections (
    charge_id INT NOT NULL REFERENCES charges(charge_id) ON DELETE CASCADE,
    section_id INT NOT NULL REFERENCES law_sections(section_id) ON DELETE RESTRICT,
    PRIMARY KEY (charge_id, section_id)
);

-- ------------------------------------------------------------------------------
-- 6. BAIL APPLICATIONS, HEARINGS & BAIL DECISIONS
-- ------------------------------------------------------------------------------
CREATE TABLE bail_applications (
    bail_id SERIAL PRIMARY KEY,
    case_id INT NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    applied_by INT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    application_date DATE NOT NULL DEFAULT CURRENT_DATE,
    bail_type VARCHAR(50) NOT NULL 
        CONSTRAINT chk_bail_type CHECK (bail_type IN ('REGULAR', 'ANTICIPATORY', 'INTERIM', 'DEFAULT_STATUTORY')),
    grounds TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' 
        CONSTRAINT chk_bail_status CHECK (status IN ('PENDING', 'HEARING_SCHEDULED', 'GRANTED', 'REJECTED', 'DISMISSED_WITHDRAWN')),
    risk_score NUMERIC(5,2) DEFAULT NULL, -- Calculated by Bail Intelligence Engine (0.00 to 100.00)
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hearings (
    hearing_id SERIAL PRIMARY KEY,
    case_id INT NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    judge_id INT NOT NULL REFERENCES judges(judge_id) ON DELETE RESTRICT,
    hearing_date TIMESTAMP WITH TIME ZONE NOT NULL,
    stage VARCHAR(60) NOT NULL 
        CONSTRAINT chk_hearing_stage CHECK (stage IN ('FIRST_HEARING', 'ARGUMENTS_ON_BAIL', 'EVIDENCE_ADMISSION', 'CROSS_EXAMINATION', 'FINAL_ORDER')),
    outcome VARCHAR(100),
    next_hearing_date TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    CONSTRAINT chk_next_hearing_future CHECK (next_hearing_date IS NULL OR next_hearing_date > hearing_date)
);

CREATE TABLE bail_decisions (
    decision_id SERIAL PRIMARY KEY,
    bail_id INT NOT NULL UNIQUE REFERENCES bail_applications(bail_id) ON DELETE CASCADE,
    judge_id INT NOT NULL REFERENCES judges(judge_id) ON DELETE RESTRICT,
    hearing_id INT REFERENCES hearings(hearing_id) ON DELETE SET NULL,
    decision VARCHAR(30) NOT NULL 
        CONSTRAINT chk_decision CHECK (decision IN ('GRANTED', 'REJECTED', 'CONDITIONAL_RELEASE', 'DISMISSED')),
    decision_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reasoning TEXT NOT NULL,
    conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 7. DOCUMENTS & DIGITAL EVIDENCE (Case Transcripts, Petitions, Orders)
-- ------------------------------------------------------------------------------
CREATE TABLE documents (
    document_id SERIAL PRIMARY KEY,
    case_id INT NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    uploaded_by INT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    document_type VARCHAR(50) NOT NULL 
        CONSTRAINT chk_doc_type CHECK (document_type IN ('FIR', 'CHARGESHEET', 'BAIL_PETITION', 'MEDICAL_REPORT', 'ORDER_COPY', 'EVIDENCE')),
    file_url TEXT NOT NULL,
    extracted_text TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- ------------------------------------------------------------------------------
-- 8. VECTOR DATABASE COMPONENT: JUDICIAL PRECEDENT REPOSITORY (pgvector)
-- ------------------------------------------------------------------------------
-- Stores landmark bail judgments & precedent embeddings for semantic similarity search
CREATE TABLE judicial_precedents (
    precedent_id SERIAL PRIMARY KEY,
    citation VARCHAR(150) NOT NULL UNIQUE,
    court_level VARCHAR(50) NOT NULL, -- Supreme Court, High Court of Karnataka, etc.
    bench VARCHAR(150),
    judgment_year INT NOT NULL,
    offence_categories VARCHAR(255),
    facts_summary TEXT NOT NULL,
    ratio_decidendi TEXT NOT NULL,
    decision_outcome VARCHAR(30) NOT NULL CHECK (decision_outcome IN ('BAIL_GRANTED', 'BAIL_DENIED')),
    embedding vector(384), -- 384-dimensional dense vectors (e.g. all-MiniLM-L6-v2)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 9. DDL: ALTER STATEMENTS DEMONSTRATING SCHEMA EVOLUTION
-- ------------------------------------------------------------------------------
-- Add audit tracking column to cases
ALTER TABLE cases ADD COLUMN IF NOT EXISTS priority_level VARCHAR(20) DEFAULT 'STANDARD' 
    CONSTRAINT chk_case_priority CHECK (priority_level IN ('LOW', 'STANDARD', 'URGENT', 'EXPEDITED'));

-- Add surety bond amount to bail_decisions
ALTER TABLE bail_decisions ADD COLUMN IF NOT EXISTS surety_amount NUMERIC(12,2) DEFAULT 0.00;

-- ------------------------------------------------------------------------------
-- 10. DATABASE SECURITY AUDIT LOG TABLE
-- ------------------------------------------------------------------------------
-- Tamper-proof audit table automatically populated via trigger on case status change
CREATE TABLE IF NOT EXISTS case_status_audit_log (
    audit_id SERIAL PRIMARY KEY,
    case_id INT NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    case_number VARCHAR(60) NOT NULL,
    old_status VARCHAR(35),
    new_status VARCHAR(35) NOT NULL,
    changed_by VARCHAR(120) DEFAULT 'Judicial Officer',
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 11. INDEXES (B-Tree, Full-Text GIN, HNSW Vector)
-- ------------------------------------------------------------------------------
-- B-Tree Indexes on Foreign Keys and High-Frequency Filter Columns
CREATE INDEX idx_cases_court_id ON cases(court_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_filing_date ON cases(filing_date);
CREATE INDEX idx_bail_case_id ON bail_applications(case_id);
CREATE INDEX idx_bail_status ON bail_applications(status);
CREATE INDEX idx_hearings_judge_date ON hearings(judge_id, hearing_date);
CREATE INDEX idx_case_parties_person ON case_parties(person_id);

-- GIN Indexes for Full-Text Search on Case Descriptions & Document Transcripts
CREATE INDEX idx_cases_description_fts ON cases USING gin(to_tsvector('english', coalesce(description, '')));
CREATE INDEX idx_documents_extracted_fts ON documents USING gin(to_tsvector('english', coalesce(extracted_text, '')));

-- HNSW Vector Index for Sub-Millisecond Cosine Similarity Search
CREATE INDEX idx_precedents_embedding_hnsw ON judicial_precedents USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
