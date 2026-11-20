-- ==============================================================================
-- PROJECT: JURISPREDICT - LEGAL CASE & BAIL INTELLIGENCE SYSTEM
-- ADVANCED DATABASE FEATURES SCRIPT (SQL + VECTOR)
-- INCLUDES: Views, Functions, Stored Procedures, Triggers, Transactions, Vector Search
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ADVANCED DATABASE VIEWS (SQL Concept 1)
-- ------------------------------------------------------------------------------

-- View 1: Bail Intelligence Pipeline (Case + Bail Application + Charges + Risk)
CREATE OR REPLACE VIEW vw_bail_intelligence_summary AS
SELECT 
    b.bail_id,
    b.case_id,
    c.case_number,
    c.title AS case_title,
    crt.court_name,
    crt.court_type,
    p.name AS accused_name,
    p.gender,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth)) AS accused_age,
    b.bail_type,
    b.application_date,
    b.status AS bail_status,
    b.risk_score,
    COUNT(ch.charge_id) AS total_charges,
    COUNT(CASE WHEN o.bailable = FALSE THEN 1 END) AS non_bailable_charges_count,
    STRING_AGG(DISTINCT ls.section_number, ', ') AS sections_invoked,
    u.name AS filed_by_advocate
FROM bail_applications b
JOIN cases c ON b.case_id = c.case_id
JOIN courts crt ON c.court_id = crt.court_id
JOIN users u ON b.applied_by = u.user_id
LEFT JOIN case_parties cp ON c.case_id = cp.case_id AND cp.party_role = 'ACCUSED'
LEFT JOIN persons p ON cp.person_id = p.person_id
LEFT JOIN charges ch ON c.case_id = ch.case_id
LEFT JOIN offences o ON ch.offence_id = o.offence_id
LEFT JOIN charge_law_sections cls ON ch.charge_id = cls.charge_id
LEFT JOIN law_sections ls ON cls.section_id = ls.section_id
GROUP BY 
    b.bail_id, b.case_id, c.case_number, c.title, crt.court_name, 
    crt.court_type, p.name, p.gender, p.date_of_birth, b.bail_type, 
    b.application_date, b.status, b.risk_score, u.name;

-- View 2: Judicial Workload & Bail Grant Analytics
CREATE OR REPLACE VIEW vw_judge_caseload_metrics AS
SELECT 
    j.judge_id,
    j.name AS judge_name,
    j.designation,
    crt.court_name,
    COUNT(DISTINCT h.hearing_id) AS total_hearings_conducted,
    COUNT(DISTINCT bd.decision_id) AS total_bail_decisions_rendered,
    COUNT(DISTINCT CASE WHEN bd.decision = 'GRANTED' THEN bd.decision_id END) AS bails_granted,
    COUNT(DISTINCT CASE WHEN bd.decision = 'REJECTED' THEN bd.decision_id END) AS bails_rejected,
    ROUND(
        (COUNT(DISTINCT CASE WHEN bd.decision = 'GRANTED' THEN bd.decision_id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT bd.decision_id), 0)) * 100, 2
    ) AS bail_grant_percentage
FROM judges j
JOIN courts crt ON j.court_id = crt.court_id
LEFT JOIN hearings h ON j.judge_id = h.judge_id
LEFT JOIN bail_decisions bd ON j.judge_id = bd.judge_id
GROUP BY j.judge_id, j.name, j.designation, crt.court_name;

-- View 3: Complete Legal Case Dossier
CREATE OR REPLACE VIEW vw_case_full_dossier AS
SELECT 
    c.case_id,
    c.case_number,
    c.title,
    c.status AS case_status,
    c.priority_level,
    c.filing_date,
    crt.court_name,
    (SELECT p.name FROM case_parties cp JOIN persons p ON cp.person_id = p.person_id 
     WHERE cp.case_id = c.case_id AND cp.party_role = 'ACCUSED' LIMIT 1) AS primary_accused,
    (SELECT p.name FROM case_parties cp JOIN persons p ON cp.person_id = p.person_id 
     WHERE cp.case_id = c.case_id AND cp.party_role = 'PETITIONER' LIMIT 1) AS petitioner_complainant,
    COUNT(DISTINCT ch.charge_id) AS count_charges,
    COUNT(DISTINCT h.hearing_id) AS count_hearings,
    COUNT(DISTINCT d.document_id) AS count_documents,
    MAX(h.hearing_date) AS last_hearing_date,
    MAX(h.next_hearing_date) AS next_scheduled_hearing
FROM cases c
JOIN courts crt ON c.court_id = crt.court_id
LEFT JOIN charges ch ON c.case_id = ch.case_id
LEFT JOIN hearings h ON c.case_id = h.case_id
LEFT JOIN documents d ON c.case_id = d.case_id
GROUP BY c.case_id, c.case_number, c.title, c.status, c.priority_level, c.filing_date, crt.court_name;

-- ------------------------------------------------------------------------------
-- 2. STORED FUNCTIONS & PROCEDURES (SQL Concept 2)
-- ------------------------------------------------------------------------------

-- Function: Compute Bail Risk Score using Criminal Metrics & Offence Weights
CREATE OR REPLACE FUNCTION fn_calculate_bail_risk_score(p_case_id INT, p_bail_id INT)
RETURNS NUMERIC AS $$
DECLARE
    v_base_score NUMERIC := 15.0;
    v_heinous_count INT := 0;
    v_non_bailable_count INT := 0;
    v_repeat_offender_count INT := 0;
    v_accused_person_id INT;
    v_final_score NUMERIC := 0.0;
BEGIN
    -- 1. Identify primary accused person
    SELECT cp.person_id INTO v_accused_person_id
    FROM case_parties cp
    WHERE cp.case_id = p_case_id AND cp.party_role = 'ACCUSED'
    LIMIT 1;

    -- 2. Count heinous and non-bailable offences
    SELECT 
        COUNT(CASE WHEN o.severity_level = 'HEINOUS' OR o.severity_level = 'CRITICAL' THEN 1 END),
        COUNT(CASE WHEN o.bailable = FALSE THEN 1 END)
    INTO v_heinous_count, v_non_bailable_count
    FROM charges ch
    JOIN offences o ON ch.offence_id = o.offence_id
    WHERE ch.case_id = p_case_id;

    -- 3. Check for repeat offender across other cases
    IF v_accused_person_id IS NOT NULL THEN
        SELECT COUNT(DISTINCT case_id) INTO v_repeat_offender_count
        FROM case_parties
        WHERE person_id = v_accused_person_id AND case_id <> p_case_id;
    END IF;

    -- 4. Weighted scoring algorithm
    v_final_score := v_base_score 
                     + (v_heinous_count * 30.0) 
                     + (v_non_bailable_count * 15.0) 
                     + (v_repeat_offender_count * 20.0);

    -- Cap score between 5.0 and 99.0
    IF v_final_score > 99.0 THEN
        v_final_score := 99.0;
    ELSIF v_final_score < 5.0 THEN
        v_final_score := 5.0;
    END IF;

    -- Update bail application record
    UPDATE bail_applications
    SET risk_score = v_final_score
    WHERE bail_id = p_bail_id;

    RETURN v_final_score;
END;
$$ LANGUAGE plpgsql;

-- Stored Procedure: Atomic Adjudication of Bail Decision
CREATE OR REPLACE PROCEDURE sp_adjudicate_bail(
    p_bail_id INT,
    p_judge_id INT,
    p_hearing_id INT,
    p_decision VARCHAR(30),
    p_reasoning TEXT,
    p_conditions TEXT,
    p_surety_amount NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_case_id INT;
BEGIN
    -- Validate bail application exists and is pending
    SELECT case_id INTO v_case_id
    FROM bail_applications
    WHERE bail_id = p_bail_id;

    IF v_case_id IS NULL THEN
        RAISE EXCEPTION 'Bail Application ID % does not exist.', p_bail_id;
    END IF;

    -- Insert bail decision
    INSERT INTO bail_decisions (
        bail_id, judge_id, hearing_id, decision, decision_date, reasoning, conditions, surety_amount
    ) VALUES (
        p_bail_id, p_judge_id, p_hearing_id, p_decision, CURRENT_DATE, p_reasoning, p_conditions, p_surety_amount
    );

    -- Update bail application status
    UPDATE bail_applications
    SET status = CASE 
        WHEN p_decision IN ('GRANTED', 'CONDITIONAL_RELEASE') THEN 'GRANTED'
        ELSE 'REJECTED'
    END
    WHERE bail_id = p_bail_id;

    -- If hearing was associated, update hearing outcome
    IF p_hearing_id IS NOT NULL THEN
        UPDATE hearings
        SET outcome = 'Bail ' || p_decision || ' on ' || TO_CHAR(CURRENT_DATE, 'DD-Mon-YYYY')
        WHERE hearing_id = p_hearing_id;
    END IF;

    RAISE NOTICE 'Bail Application % successfully adjudicated with decision %', p_bail_id, p_decision;
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. TRIGGERS & INTEGRITY RULES (SQL Concept 3)
-- ------------------------------------------------------------------------------

-- Trigger Function 1: Prevent Judge Double Booking (Overlap within 45 minutes)
CREATE OR REPLACE FUNCTION fn_check_judge_hearing_conflict()
RETURNS TRIGGER AS $$
DECLARE
    v_conflict_count INT;
BEGIN
    SELECT COUNT(*) INTO v_conflict_count
    FROM hearings
    WHERE judge_id = NEW.judge_id
      AND hearing_id <> COALESCE(NEW.hearing_id, -1)
      AND hearing_date BETWEEN (NEW.hearing_date - INTERVAL '45 minutes') 
                           AND (NEW.hearing_date + INTERVAL '45 minutes');

    IF v_conflict_count > 0 THEN
        RAISE EXCEPTION 'Judge ID % is already presiding over another hearing within 45 minutes of %.',
            NEW.judge_id, NEW.hearing_date;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_judge_conflict
BEFORE INSERT OR UPDATE OF judge_id, hearing_date ON hearings
FOR EACH ROW
EXECUTE FUNCTION fn_check_judge_hearing_conflict();

-- Trigger Function 2: Auto Synchronize Case Status upon Bail Decision
CREATE OR REPLACE FUNCTION fn_sync_case_on_bail_decision()
RETURNS TRIGGER AS $$
DECLARE
    v_case_id INT;
BEGIN
    SELECT case_id INTO v_case_id
    FROM bail_applications
    WHERE bail_id = NEW.bail_id;

    IF NEW.decision IN ('GRANTED', 'CONDITIONAL_RELEASE') THEN
        UPDATE cases
        SET status = 'BAIL_GRANTED', updated_at = CURRENT_TIMESTAMP
        WHERE case_id = v_case_id;
    ELSE
        UPDATE cases
        SET status = 'BAIL_REJECTED', updated_at = CURRENT_TIMESTAMP
        WHERE case_id = v_case_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_case_status
AFTER INSERT ON bail_decisions
FOR EACH ROW
EXECUTE FUNCTION fn_sync_case_on_bail_decision();

-- Trigger Function 3: Auto-Calculate Risk Score on New Bail Application
CREATE OR REPLACE FUNCTION fn_auto_compute_risk_on_apply()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM fn_calculate_bail_risk_score(NEW.case_id, NEW.bail_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_compute_risk
AFTER INSERT ON bail_applications
FOR EACH ROW
EXECUTE FUNCTION fn_auto_compute_risk_on_apply();

-- Trigger Function 4: Security Audit Trail for Case Status Changes
-- Automatically records every status transition (e.g. BAIL_PENDING -> BAIL_GRANTED)
CREATE TABLE IF NOT EXISTS case_status_audit_log (
    audit_id SERIAL PRIMARY KEY,
    case_id INT NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
    case_number VARCHAR(60) NOT NULL,
    old_status VARCHAR(35),
    new_status VARCHAR(35) NOT NULL,
    changed_by VARCHAR(120) DEFAULT 'Judicial Officer',
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION fn_audit_case_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO case_status_audit_log (case_id, case_number, old_status, new_status, changed_at)
        VALUES (NEW.case_id, NEW.case_number, OLD.status, NEW.status, CURRENT_TIMESTAMP);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_case_status
AFTER UPDATE OF status ON cases
FOR EACH ROW
EXECUTE FUNCTION fn_audit_case_status_change();

-- ------------------------------------------------------------------------------
-- 4. ACID TRANSACTIONS DEMONSTRATION (SQL Concept 4)
-- ------------------------------------------------------------------------------
-- Demonstration script of Atomic Filing Transaction with SAVEPOINT and ROLLBACK
CREATE OR REPLACE PROCEDURE sp_atomic_case_filing_transaction(
    p_court_id INT,
    p_user_id INT,
    p_case_number VARCHAR(60),
    p_title VARCHAR(255),
    p_description TEXT,
    p_accused_person_id INT,
    p_offence_id INT,
    p_section_id INT,
    p_judge_id INT,
    p_hearing_date TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_new_case_id INT;
    v_new_charge_id INT;
BEGIN
    -- Start of Atomic Unit
    -- Step 1: Create Case
    INSERT INTO cases (court_id, filed_by, case_number, title, description, status)
    VALUES (p_court_id, p_user_id, p_case_number, p_title, p_description, 'FILED')
    RETURNING case_id INTO v_new_case_id;

    -- Savepoint after case creation
    SAVEPOINT sp_case_created;

    -- Step 2: Link Accused Party
    INSERT INTO case_parties (case_id, person_id, party_role, is_active)
    VALUES (v_new_case_id, p_accused_person_id, 'ACCUSED', TRUE);

    -- Step 3: Register Charge
    INSERT INTO charges (case_id, offence_id, description)
    VALUES (v_new_case_id, p_offence_id, 'Initial chargesheet filed by prosecution')
    RETURNING charge_id INTO v_new_charge_id;

    -- Step 4: Link Law Section
    INSERT INTO charge_law_sections (charge_id, section_id)
    VALUES (v_new_charge_id, p_section_id);

    -- Step 5: Schedule Preliminary Hearing
    INSERT INTO hearings (case_id, judge_id, hearing_date, stage, outcome)
    VALUES (v_new_case_id, p_judge_id, p_hearing_date, 'FIRST_HEARING', 'Scheduled for initial charge framing');

    RAISE NOTICE 'Case % filed atomically with ID %', p_case_number, v_new_case_id;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO SAVEPOINT sp_case_created;
        RAISE EXCEPTION 'Atomic filing transaction aborted: %', SQLERRM;
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. VECTOR SIMILARITY SEARCH (Vector DB Concept - pgvector)
-- ------------------------------------------------------------------------------
-- Function to retrieve Top-K landmark judicial precedents matching advocate's bail grounds
CREATE OR REPLACE FUNCTION fn_semantic_precedent_search(
    p_query_embedding vector(384),
    p_limit INT DEFAULT 3
)
RETURNS TABLE (
    citation VARCHAR(150),
    court_level VARCHAR(50),
    judgment_year INT,
    facts_summary TEXT,
    ratio_decidendi TEXT,
    decision_outcome VARCHAR(30),
    similarity_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jp.citation,
        jp.court_level,
        jp.judgment_year,
        jp.facts_summary,
        jp.ratio_decidendi,
        jp.decision_outcome,
        ROUND(((1 - (jp.embedding <=> p_query_embedding)) * 100)::NUMERIC, 2) AS similarity_percentage
    FROM judicial_precedents jp
    ORDER BY jp.embedding <=> p_query_embedding ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
