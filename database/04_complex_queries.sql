-- ==============================================================================
-- PROJECT: JURISPREDICT - LEGAL CASE & BAIL INTELLIGENCE SYSTEM
-- ADVANCED & COMPLEX SQL QUERIES (JOIN, GROUP BY, HAVING, CTE, WINDOW, VECTOR)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- QUERY 1: MULTI-TABLE 6-WAY JOIN (Case Legal Dossier with Charges & Accused)
-- Demonstrates: INNER JOIN, LEFT JOIN, Aggregation, STRING_AGG, WHERE, ORDER BY
-- ------------------------------------------------------------------------------
SELECT 
    c.case_number,
    c.title AS case_title,
    crt.court_name,
    p_accused.name AS accused_name,
    p_accused.gender AS accused_gender,
    b.bail_type,
    b.status AS bail_status,
    COALESCE(b.risk_score, 0.0) AS bail_risk_score,
    STRING_AGG(DISTINCT o.offence_name, ' | ') AS invoked_offences,
    STRING_AGG(DISTINCT ls.section_number, ', ') AS criminal_sections,
    COUNT(DISTINCT d.document_id) AS total_evidence_documents
FROM cases c
JOIN courts crt ON c.court_id = crt.court_id
JOIN case_parties cp ON c.case_id = cp.case_id AND cp.party_role = 'ACCUSED'
JOIN persons p_accused ON cp.person_id = p_accused.person_id
LEFT JOIN bail_applications b ON c.case_id = b.case_id
LEFT JOIN charges ch ON c.case_id = ch.case_id
LEFT JOIN offences o ON ch.offence_id = o.offence_id
LEFT JOIN charge_law_sections cls ON ch.charge_id = cls.charge_id
LEFT JOIN law_sections ls ON cls.section_id = ls.section_id
LEFT JOIN documents d ON c.case_id = d.case_id
GROUP BY 
    c.case_number, c.title, crt.court_name, p_accused.name, 
    p_accused.gender, b.bail_type, b.status, b.risk_score
ORDER BY b.risk_score DESC;

-- ------------------------------------------------------------------------------
-- QUERY 2: GROUP BY WITH HAVING & AGGREGATE METRICS
-- Find courts where total non-bailable charges exceed bailable charges
-- Demonstrates: GROUP BY, HAVING, Conditional SUM/COUNT, Filter on Aggregates
-- ------------------------------------------------------------------------------
SELECT 
    crt.court_name,
    crt.court_type,
    COUNT(DISTINCT c.case_id) AS total_cases_filed,
    COUNT(ch.charge_id) AS total_charges_framed,
    SUM(CASE WHEN o.bailable = FALSE THEN 1 ELSE 0 END) AS non_bailable_charges,
    SUM(CASE WHEN o.bailable = TRUE THEN 1 ELSE 0 END) AS bailable_charges
FROM courts crt
JOIN cases c ON crt.court_id = c.court_id
JOIN charges ch ON c.case_id = ch.case_id
JOIN offences o ON ch.offence_id = o.offence_id
GROUP BY crt.court_id, crt.court_name, crt.court_type
HAVING SUM(CASE WHEN o.bailable = FALSE THEN 1 ELSE 0 END) >= 1
ORDER BY non_bailable_charges DESC;

-- ------------------------------------------------------------------------------
-- QUERY 3: ADVANCED WINDOW FUNCTIONS (DENSE_RANK & PARTITION BY)
-- Rank judges by hearing volume within each court division
-- Demonstrates: DENSE_RANK() OVER (PARTITION BY ... ORDER BY ...), Window metrics
-- ------------------------------------------------------------------------------
SELECT 
    crt.court_name,
    j.name AS judge_name,
    j.designation,
    COUNT(h.hearing_id) AS total_hearings,
    DENSE_RANK() OVER (
        PARTITION BY crt.court_id 
        ORDER BY COUNT(h.hearing_id) DESC
    ) AS court_caseload_rank,
    ROUND(
        AVG(COUNT(h.hearing_id)) OVER (PARTITION BY crt.court_id), 1
    ) AS court_average_hearings
FROM judges j
JOIN courts crt ON j.court_id = crt.court_id
LEFT JOIN hearings h ON j.judge_id = h.judge_id
GROUP BY crt.court_id, crt.court_name, j.judge_id, j.name, j.designation
ORDER BY crt.court_name, court_caseload_rank;

-- ------------------------------------------------------------------------------
-- QUERY 4: COMMON TABLE EXPRESSION (CTE) WITH BAIL RISK STRATIFICATION
-- Stratify pending bail applications into Risk Bands (Low, Moderate, High)
-- Demonstrates: WITH clause (CTE), CASE WHEN classification, Secondary aggregation
-- ------------------------------------------------------------------------------
WITH BailRiskTiers AS (
    SELECT 
        b.bail_id,
        c.case_number,
        p.name AS applicant_name,
        b.bail_type,
        b.application_date,
        b.risk_score,
        CASE 
            WHEN b.risk_score < 30.0 THEN 'LOW RISK (Eligible for PR Bond)'
            WHEN b.risk_score BETWEEN 30.0 AND 60.0 THEN 'MODERATE RISK (Conditional Bail)'
            ELSE 'HIGH RISK (Requires Strict Surety)'
        END AS risk_tier
    FROM bail_applications b
    JOIN cases c ON b.case_id = c.case_id
    JOIN case_parties cp ON c.case_id = cp.case_id AND cp.party_role = 'ACCUSED'
    JOIN persons p ON cp.person_id = p.person_id
    WHERE b.status = 'PENDING'
)
SELECT 
    risk_tier,
    COUNT(*) AS applications_count,
    ROUND(AVG(risk_score), 2) AS average_risk_score,
    STRING_AGG(case_number || ' (' || applicant_name || ')', '; ') AS pending_cases
FROM BailRiskTiers
GROUP BY risk_tier
ORDER BY average_risk_score ASC;

-- ------------------------------------------------------------------------------
-- QUERY 5: CORRELATED SUBQUERY
-- Find accused individuals who have active charges under non-bailable offences
-- and whose bail application was submitted prior to the latest court hearing
-- Demonstrates: Correlated Subquery with EXISTS and Sub-SELECT
-- ------------------------------------------------------------------------------
SELECT 
    p.person_id,
    p.name AS accused_name,
    p.phone,
    c.case_number,
    b.application_date
FROM persons p
JOIN case_parties cp ON p.person_id = cp.person_id
JOIN cases c ON cp.case_id = c.case_id
JOIN bail_applications b ON c.case_id = b.case_id
WHERE cp.party_role = 'ACCUSED'
  AND EXISTS (
      SELECT 1 
      FROM charges ch
      JOIN offences o ON ch.offence_id = o.offence_id
      WHERE ch.case_id = c.case_id 
        AND o.bailable = FALSE
  )
  AND b.application_date <= (
      SELECT COALESCE(MAX(h.hearing_date)::DATE, CURRENT_DATE)
      FROM hearings h
      WHERE h.case_id = c.case_id
  );

-- ------------------------------------------------------------------------------
-- QUERY 6: VECTOR SIMILARITY SEARCH (pgvector Cosine Distance)
-- Retrieve top-3 Supreme Court / High Court precedents nearest to a query vector
-- Demonstrates: Vector operator <=>, Cosine Similarity computation, ORDER BY vector
-- ------------------------------------------------------------------------------
SELECT 
    precedent_id,
    citation,
    court_level,
    judgment_year,
    decision_outcome,
    ratio_decidendi,
    ROUND(((1 - (embedding <=> (
        SELECT embedding FROM judicial_precedents WHERE citation LIKE '%Satender Kumar Antil%' LIMIT 1
    ))) * 100)::NUMERIC, 2) AS cosine_similarity_percentage
FROM judicial_precedents
ORDER BY embedding <=> (
    SELECT embedding FROM judicial_precedents WHERE citation LIKE '%Satender Kumar Antil%' LIMIT 1
) ASC
LIMIT 3;

-- ------------------------------------------------------------------------------
-- QUERY 7: FULL-TEXT SEARCH (GIN Index with ts_vector and ts_query)
-- Search legal case documents for keywords 'fraud' and 'escrow'
-- Demonstrates: to_tsvector, to_tsquery, ts_rank ranking
-- ------------------------------------------------------------------------------
SELECT 
    d.document_id,
    c.case_number,
    d.document_type,
    d.file_url,
    ts_rank(to_tsvector('english', d.extracted_text), to_tsquery('english', 'fraud & credentials')) AS relevance_score,
    d.description
FROM documents d
JOIN cases c ON d.case_id = c.case_id
WHERE to_tsvector('english', d.extracted_text) @@ to_tsquery('english', 'fraud & credentials')
ORDER BY relevance_score DESC;

-- ------------------------------------------------------------------------------
-- QUERY 8: DML OPERATIONS (INSERT, UPDATE, DELETE WITH INTEGRITY)
-- Demonstrates: Clean DML operations modifying state safely
-- ------------------------------------------------------------------------------
-- 8a. INSERT a new Hearing
INSERT INTO hearings (case_id, judge_id, hearing_date, stage, outcome, remarks)
VALUES (1, 2, '2026-11-12 10:30:00+05:30', 'ARGUMENTS_ON_BAIL', 'Pending', 'Scheduled for Senior Advocate argument');

-- 8b. UPDATE Bail Application Remarks and Risk Score
UPDATE bail_applications
SET remarks = 'Hearing expedited upon petitioner medical affidavit',
    risk_score = 32.50
WHERE bail_id = 1;

-- 8c. Safe DELETE of an unlinked draft document (integrity-guarded)
DELETE FROM documents
WHERE document_id = 999 AND document_type = 'EVIDENCE';
