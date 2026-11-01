-- ==============================================================================
-- PROJECT: JURISPREDICT - LEGAL CASE & BAIL INTELLIGENCE SYSTEM
-- REALISTIC SEED DATA SCRIPT (SQL + VECTOR PRECEDENTS)
-- ==============================================================================

-- 1. Insert Roles
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'ADMIN', 'System administrator with full configuration and user provisioning rights'),
(2, 'JUDGE', 'Judicial officer presiding over hearings and adjudicating bail petitions'),
(3, 'ADVOCATE', 'Legal practitioner filing cases, bail petitions, and submitting evidence'),
(4, 'REGISTRAR', 'Court registry clerk managing case listings, roasters, and filings')
ON CONFLICT (role_id) DO NOTHING;

-- 2. Insert Users (Valid bcrypt hash for demo password 'Password@123')
INSERT INTO users (user_id, role_id, name, email, password_hash, phone, status) VALUES
(1, 1, 'System Admin', 'admin@jurispredict.gov.in', '$2a$10$/cSyP/vPvVcrJN/aZYJ0e.nDONuyHYXmboVHjUPB74woL3eio9j9W', '+91-9876543210', 'ACTIVE'),
(2, 2, 'Hon. Justice Rajesh Sharma', 'judge.sharma@karnatakacourts.gov.in', '$2a$10$/cSyP/vPvVcrJN/aZYJ0e.nDONuyHYXmboVHjUPB74woL3eio9j9W', '+91-9876543211', 'ACTIVE'),
(3, 2, 'Hon. Justice Anuradha Banerjee', 'judge.banerjee@karnatakacourts.gov.in', '$2a$10$/cSyP/vPvVcrJN/aZYJ0e.nDONuyHYXmboVHjUPB74woL3eio9j9W', '+91-9876543212', 'ACTIVE'),
(4, 3, 'Adv. Shantheni Shenoy', 'shantheni.adv@barcouncil.org', '$2a$10$/cSyP/vPvVcrJN/aZYJ0e.nDONuyHYXmboVHjUPB74woL3eio9j9W', '+91-9876543213', 'ACTIVE'),
(5, 3, 'Adv. Shriranjini Kumar', 'shriranjini.adv@barcouncil.org', '$2a$10$/cSyP/vPvVcrJN/aZYJ0e.nDONuyHYXmboVHjUPB74woL3eio9j9W', '+91-9876543214', 'ACTIVE'),
(6, 4, 'Ramesh Babu (Registrar)', 'registry.blr@karnatakacourts.gov.in', '$2a$10$/cSyP/vPvVcrJN/aZYJ0e.nDONuyHYXmboVHjUPB74woL3eio9j9W', '+91-9876543215', 'ACTIVE')
ON CONFLICT (user_id) DO NOTHING;

-- 3. Insert Courts
INSERT INTO courts (court_id, court_name, court_type, location, address) VALUES
(1, 'High Court of Karnataka', 'HIGH_COURT', 'Bengaluru', 'Opposite Vidhana Soudha, Ambedkar Veedhi, Bengaluru - 560001'),
(2, 'City Civil and Sessions Court Bengaluru', 'SESSIONS_COURT', 'Bengaluru', 'Kempegowda Road, Gandhi Nagar, Bengaluru - 560009'),
(3, 'Chief Metropolitan Magistrate Court Bengaluru', 'MAGISTRATE_COURT', 'Bengaluru', 'Nrupathunga Road, Bengaluru - 560001')
ON CONFLICT (court_id) DO NOTHING;

-- 4. Insert Judges
INSERT INTO judges (judge_id, court_id, name, designation, email, status) VALUES
(1, 1, 'Hon. Justice Rajesh Sharma', 'High Court Judge (Criminal Division)', 'judge.sharma@karnatakacourts.gov.in', 'ACTIVE'),
(2, 2, 'Hon. Justice Anuradha Banerjee', 'Principal District & Sessions Judge', 'judge.banerjee@karnatakacourts.gov.in', 'ACTIVE'),
(3, 3, 'Hon. K. V. Mohan', 'Chief Metropolitan Magistrate', 'magistrate.mohan@karnatakacourts.gov.in', 'ACTIVE')
ON CONFLICT (judge_id) DO NOTHING;

-- 5. Insert Persons (Accused, Petitioners, Witnesses)
INSERT INTO persons (person_id, name, gender, date_of_birth, address, phone, email) VALUES
(1, 'Vikram Malhotra', 'MALE', '1992-05-14', 'Flat 402, Prestige Tower, Indiranagar, Bengaluru', '+91-9845012345', 'vikram.m@gmail.com'),
(2, 'Priya Deshmukh', 'FEMALE', '1988-11-20', 'No 12, Koramangala 4th Block, Bengaluru', '+91-9845023456', 'priya.desh@gmail.com'),
(3, 'Rahul Verma', 'MALE', '1985-03-08', 'Plot 88, HSR Layout Sector 2, Bengaluru', '+91-9845034567', 'rahul.verma@fintech.co'),
(4, 'Inspector S. Patil', 'MALE', '1979-08-15', 'Cyber Crime Police Station, CID Headquarters, Bengaluru', '+91-9845045678', 's.patil@ksp.gov.in'),
(5, 'Sunita Rao (Surety)', 'FEMALE', '1965-02-10', 'No 77, Malleshwaram 15th Cross, Bengaluru', '+91-9845056789', 'sunita.rao@outlook.com')
ON CONFLICT (person_id) DO NOTHING;

-- 6. Insert Cases
INSERT INTO cases (case_id, court_id, filed_by, case_number, title, filing_date, description, status, priority_level) VALUES
(1, 2, 4, 'CNR-KA-BLR-2026-00101', 'State of Karnataka v. Vikram Malhotra', '2026-09-15', 
 'Allegations of cyber financial fraud, unauthorized data access, and diversion of company escrow funds under Section 420 IPC and 66D IT Act.', 
 'BAIL_PENDING', 'URGENT'),
(2, 2, 5, 'CNR-KA-BLR-2026-00204', 'Rahul Verma v. Priya Deshmukh', '2026-10-02', 
 'Private complaint alleging criminal breach of trust regarding commercial partnership contract and failure to refund vendor deposit.', 
 'HEARING_IN_PROGRESS', 'STANDARD'),
(3, 3, 4, 'CNR-KA-BLR-2026-00318', 'State v. Mahesh Patil', '2026-10-18', 
 'Public affray and minor altercation in market premises under section 323 IPC.', 
 'FILED', 'LOW')
ON CONFLICT (case_id) DO NOTHING;

-- 7. Insert Case Parties
INSERT INTO case_parties (case_id, person_id, party_role, is_active) VALUES
(1, 1, 'ACCUSED', TRUE),
(1, 3, 'PETITIONER', TRUE),
(1, 4, 'WITNESS', TRUE),
(2, 2, 'ACCUSED', TRUE),
(2, 3, 'PETITIONER', TRUE),
(2, 5, 'SURETY', TRUE)
ON CONFLICT (case_id, person_id) DO NOTHING;

-- 8. Insert Offences
INSERT INTO offences (offence_id, offence_name, description, bailable, severity_level) VALUES
(1, 'Cheating & Dishonest Inducement', 'Deceiving any person and fraudulently inducing delivery of property', FALSE, 'MODERATE'),
(2, 'Criminal Breach of Trust', 'Dishonest misappropriation of entrusted property by merchant or agent', FALSE, 'MODERATE'),
(3, 'Cyber Impersonation & Fraud', 'Cheating by using computer resource or communication device', FALSE, 'MODERATE'),
(4, 'Voluntarily Causing Grievous Hurt', 'Inflicting grievous bodily injury endangering life', FALSE, 'HEINOUS'),
(5, 'Simple Hurt & Affray', 'Causing bodily pain or fighting in a public place disturbing public peace', TRUE, 'MINOR')
ON CONFLICT (offence_id) DO NOTHING;

-- 9. Insert Law Sections
INSERT INTO law_sections (section_id, act_name, section_number, description, punishment_summary) VALUES
(1, 'Indian Penal Code', 'Section 420', 'Cheating and dishonestly inducing delivery of property', 'Imprisonment up to 7 years and fine'),
(2, 'Indian Penal Code', 'Section 406', 'Punishment for criminal breach of trust', 'Imprisonment up to 3 years or fine or both'),
(3, 'Information Technology Act', 'Section 66D', 'Punishment for cheating by personation by using computer resource', 'Imprisonment up to 3 years and fine up to 1 lakh'),
(4, 'Indian Penal Code', 'Section 325', 'Punishment for voluntarily causing grievous hurt', 'Imprisonment up to 7 years and fine'),
(5, 'Code of Criminal Procedure', 'Section 437', 'When bail may be taken in case of non-bailable offence', 'Discretionary judicial release subject to reasonable conditions'),
(6, 'Code of Criminal Procedure', 'Section 439', 'Special powers of High Court or Court of Session regarding bail', 'Wide discretion to grant regular bail')
ON CONFLICT (section_id) DO NOTHING;

-- 10. Insert Charges & Charge Law Sections
INSERT INTO charges (charge_id, case_id, offence_id, description) VALUES
(1, 1, 1, 'Inducing escrow transfer under false pretenses'),
(2, 1, 3, 'Use of forged digital certificates on server'),
(3, 2, 2, 'Withholding partnership dividend proceeds')
ON CONFLICT (charge_id) DO NOTHING;

INSERT INTO charge_law_sections (charge_id, section_id) VALUES
(1, 1),
(2, 3),
(3, 2)
ON CONFLICT (charge_id, section_id) DO NOTHING;

-- 11. Insert Bail Applications
INSERT INTO bail_applications (bail_id, case_id, applied_by, application_date, bail_type, grounds, status, risk_score, remarks) VALUES
(1, 1, 4, '2026-10-10', 'REGULAR', 
 'The accused has spent 45 days in judicial custody. Charge-sheet has been submitted; digital evidence and laptop have been seized by the IO. Applicant has clean prior record, permanent resident of Bengaluru, no flight risk, and undertakes to surrender passport.', 
 'PENDING', 35.00, 'Urgent listing requested before Court Hall 2'),
(2, 2, 5, '2026-10-20', 'ANTICIPATORY', 
 'Civil commercial dispute arising out of agency contract maliciously given criminal color. Applicant is a 38-year-old mother with dependent child, willing to deposit Rs. 5,00,000 security in escrow.', 
 'PENDING', 25.00, 'Notice issued to State PP')
ON CONFLICT (bail_id) DO NOTHING;

-- 12. Insert Hearings
INSERT INTO hearings (hearing_id, case_id, judge_id, hearing_date, stage, outcome, next_hearing_date, remarks) VALUES
(1, 1, 2, '2026-10-15 11:00:00+05:30', 'FIRST_HEARING', 'Public Prosecutor requested time to verify forensic server logs', '2026-11-05 11:30:00+05:30', 'Objections to bail filed by State'),
(2, 2, 2, '2026-10-25 14:30:00+05:30', 'ARGUMENTS_ON_BAIL', 'Interim protection granted till final hearing', '2026-11-10 14:30:00+05:30', 'Applicant directed to join investigation every Monday')
ON CONFLICT (hearing_id) DO NOTHING;

-- 13. Insert Documents
INSERT INTO documents (document_id, case_id, uploaded_by, document_type, file_url, extracted_text, uploaded_at, description) VALUES
(1, 1, 4, 'FIR', 's3://legal-vault/docs/fir_blr_cyber_042_2026.pdf', 
 'First Information Report No. 42/2026 registered at Cyber Crime Police Station under Section 420 IPC and 66D IT Act. Complainant alleges loss of Rs 18,50,000 via forged corporate payment gateway credentials.', 
 '2026-09-16 10:00:00+05:30', 'Certified True Copy of FIR'),
(2, 1, 4, 'BAIL_PETITION', 's3://legal-vault/docs/bail_petition_vikram_m.pdf', 
 'Criminal Miscellaneous Petition under Section 439 CrPC. Grounds: Search and seizure completed, all accounts frozen, custody no longer warranted for custodial interrogation.', 
 '2026-10-10 16:30:00+05:30', 'Formal Bail Application with Case Law citations'),
(3, 2, 5, 'BAIL_PETITION', 's3://legal-vault/docs/anticipatory_bail_priya.pdf', 
 'Petition under Section 438 CrPC for grant of pre-arrest bail in private complaint PCR No. 110/2026.', 
 '2026-10-20 12:15:00+05:30', 'Anticipatory bail petition with audit affidavits')
ON CONFLICT (document_id) DO NOTHING;

-- 14. Insert Judicial Precedents with 384-dimensional Embeddings (pgvector)
-- Using normalized sample dense vectors representing semantic clusters:
-- Precedent 1: Satender Kumar Antil (Bail classification & liberty)
-- Precedent 2: Arnesh Kumar (Notice under 41A, non-arrest for offences <= 7 years)
-- Precedent 3: Sanjay Chandra (Bail is the rule, jail is exception in economic offences)
-- Precedent 4: P. Chidambaram (Triple test: flight risk, witness tampering, evidence destruction)

INSERT INTO judicial_precedents (
    precedent_id, citation, court_level, bench, judgment_year, offence_categories, facts_summary, ratio_decidendi, decision_outcome, embedding
) VALUES
(1, 'Satender Kumar Antil v. CBI (2022) 10 SCC 736', 'Supreme Court of India', 'Hon. Justices S.K. Kaul & M.M. Sundresh', 2022, 
 'Economic Offences, IPC 420, CrPC 437/439', 
 'Undertrials languishing in jails due to non-compliance with statutory bail procedures. Accused cooperated during investigation and appeared on summons.', 
 'Bail is the rule and jail is the exception. Personal liberty under Article 21 cannot be deprived casually. In Category A offences (punishable up to 7 years), bail should normally be granted upon charge sheet submission without custody.', 
 'BAIL_GRANTED', 
 (SELECT array_to_string(array_agg(ROUND((cos(i*0.15))::numeric, 4)), ',')::vector FROM generate_series(1, 384) AS i)),

(2, 'Arnesh Kumar v. State of Bihar (2014) 8 SCC 273', 'Supreme Court of India', 'Hon. Justices C.K. Prasad & P.C. Ghose', 2014, 
 'Matrimonial Disputes, IPC 498A/406/420', 
 'Routine mechanical arrests made by police authorities in offences punishable with imprisonment of seven years or less without recording satisfaction.', 
 'Police officers shall not automatically arrest accused upon registration of FIR under sections carrying sentence up to 7 years. Notice under Section 41A CrPC must be served; bail should be favored when attendance is assured.', 
 'BAIL_GRANTED', 
 (SELECT array_to_string(array_agg(ROUND((sin(i*0.22))::numeric, 4)), ',')::vector FROM generate_series(1, 384) AS i)),

(3, 'Sanjay Chandra v. CBI (2012) 1 SCC 40', 'Supreme Court of India', 'Hon. Justices G.S. Singhvi & H.L. Dattu', 2012, 
 'Economic Offence, 2G Spectrum Scam, IPC 420/120B', 
 'Accused in custody for over seven months in an alleged mega economic offence. Detailed chargesheet filed, voluminous electronic documents.', 
 'The seriousness of the charge alone cannot be the sole basis for refusing bail. Pre-trial detention should not become punitive. Where investigation is complete and electronic records are secured, bail must be granted.', 
 'BAIL_GRANTED', 
 (SELECT array_to_string(array_agg(ROUND((cos(i*0.35 + 0.5))::numeric, 4)), ',')::vector FROM generate_series(1, 384) AS i)),

(4, 'State v. P. Chidambaram (2019) 16 SCC 743', 'Supreme Court of India', 'Hon. Justices R. Banumathi, A.S. Bopanna, H. Roy', 2019, 
 'INX Media Money Laundering, Prevention of Money Laundering Act / IPC', 
 'High-profile accused with international travel history seeking regular bail in economic offences investigated by central agencies.', 
 'Bail determination requires balancing individual liberty with societal interest under the triple test: flight risk, tampering of evidence, and influencing witnesses. If risk can be secured with passport deposit and travel ban, bail is warranted.', 
 'BAIL_GRANTED', 
 (SELECT array_to_string(array_agg(ROUND((sin(i*0.18 + 0.9))::numeric, 4)), ',')::vector FROM generate_series(1, 384) AS i))
ON CONFLICT (precedent_id) DO NOTHING;

-- Reset primary key sequences for clean auto-incrementing
SELECT setval('roles_role_id_seq', (SELECT MAX(role_id) FROM roles));
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
SELECT setval('courts_court_id_seq', (SELECT MAX(court_id) FROM courts));
SELECT setval('judges_judge_id_seq', (SELECT MAX(judge_id) FROM judges));
SELECT setval('persons_person_id_seq', (SELECT MAX(person_id) FROM persons));
SELECT setval('cases_case_id_seq', (SELECT MAX(case_id) FROM cases));
SELECT setval('offences_offence_id_seq', (SELECT MAX(offence_id) FROM offences));
SELECT setval('law_sections_section_id_seq', (SELECT MAX(section_id) FROM law_sections));
SELECT setval('charges_charge_id_seq', (SELECT MAX(charge_id) FROM charges));
SELECT setval('bail_applications_bail_id_seq', (SELECT MAX(bail_id) FROM bail_applications));
SELECT setval('hearings_hearing_id_seq', (SELECT MAX(hearing_id) FROM hearings));
SELECT setval('documents_document_id_seq', (SELECT MAX(document_id) FROM documents));
SELECT setval('judicial_precedents_precedent_id_seq', (SELECT MAX(precedent_id) FROM judicial_precedents));
