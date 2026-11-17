// ==============================================================================
// PROJECT: JURISPREDICT - LEGAL CASE & BAIL INTELLIGENCE SYSTEM
// NoSQL COMPONENT: MONGODB DATA MODEL & AGGREGATION PIPELINES
// Paradigm: Document Store for Unstructured FIRs, Transcripts & Dynamic Evidence
// ==============================================================================

// ------------------------------------------------------------------------------
// 1. COLLECTION: unstructured_case_dossiers
// Why NoSQL here? FIR narratives, forensic logs, and witness statements are
// semi-structured, variable in schema, and require nested JSON document storage.
// ------------------------------------------------------------------------------
db.unstructured_case_dossiers.insertMany([
  {
    case_number: "CNR-KA-BLR-2026-00101",
    court_name: "City Civil and Sessions Court Bengaluru",
    fir_details: {
      fir_number: "0042/2026",
      police_station: "Cyber Crime PS, Bengaluru",
      filing_timestamp: new Date("2026-09-15T09:30:00Z"),
      narrative: "Complainant reported unauthorized access into fintech payment settlement pool, rerouting funds via proxy server IP 192.0.2.45.",
      evidence_items: [
        { item_type: "DIGITAL_STORAGE", description: "NVMe SSD seized from suspect premises", hash_md5: "d41d8cd98f00b204e9800998ecf8427e" },
        { item_type: "LOG_FILE", description: "Syslog dump showing SSH authorization attempts", record_count: 1420 }
      ]
    },
    witness_transcripts: [
      { witness_id: "W1", name: "Inspector S. Patil", statement_date: new Date("2026-09-20"), summary: "Verified server MAC address matching accused personal laptop." }
    ],
    bail_risk_factors: {
      flight_risk_index: "LOW",
      tampering_risk_index: "NEGLIGIBLE",
      passport_surrendered: true,
      surety_verified: true
    }
  },
  {
    case_number: "CNR-KA-BLR-2026-00204",
    court_name: "City Civil and Sessions Court Bengaluru",
    fir_details: {
      fir_number: "0110/2026",
      police_station: "Commercial Street PS",
      filing_timestamp: new Date("2026-10-02T14:15:00Z"),
      narrative: "Breach of trust regarding consignment distribution escrow.",
      evidence_items: [
        { item_type: "CONTRACT_DOCUMENT", description: "Signed partnership deed dated 12-Jan-2024", pages: 28 }
      ]
    },
    bail_risk_factors: {
      flight_risk_index: "LOW",
      tampering_risk_index: "LOW",
      passport_surrendered: false,
      surety_verified: true
    }
  },
  {
    case_number: "CNR-KA-BLR-2026-00318",
    court_name: "Chief Metropolitan Magistrate Court Bengaluru",
    fir_details: {
      fir_number: "0185/2026",
      police_station: "Ulsoor Gate Police Station, Bengaluru",
      filing_timestamp: new Date("2026-10-18T11:00:00Z"),
      narrative: "Altercation and minor scuffle reported in public market area outside retail premises over parking dispute.",
      evidence_items: [
        { item_type: "MEDICAL_CERTIFICATE", description: "Outpatient wound certificate confirming simple blunt injury (MLC No 412/2026)", hospital: "Bowring & Lady Curzon Hospital" },
        { item_type: "CCTV_FOOTAGE", description: "Market entrance security camera footage (12 mins MP4)", file_size_mb: 420 }
      ]
    },
    witness_transcripts: [
      { witness_id: "W3", name: "R. Sundaram (Shopkeeper)", statement_date: new Date("2026-10-19"), summary: "Stated that argument escalated suddenly; no dangerous weapons or pre-mediation observed." }
    ],
    bail_risk_factors: {
      flight_risk_index: "NEGLIGIBLE",
      tampering_risk_index: "NEGLIGIBLE",
      passport_surrendered: false,
      surety_verified: true
    }
  }
]);

// ------------------------------------------------------------------------------
// 2. ADVANCED NoSQL AGGREGATION PIPELINE
// Calculates average digital evidence count and risk factor metrics per court
// Demonstrates: $match, $unwind, $group, $project, $sort
// ------------------------------------------------------------------------------
db.unstructured_case_dossiers.aggregate([
  // Stage 1: Filter cases from Bengaluru courts
  {
    $match: {
      court_name: { $regex: /Bengaluru/i }
    }
  },
  // Stage 2: Unwind evidence items array
  {
    $unwind: {
      path: "$fir_details.evidence_items",
      preserveNullAndEmptyArrays: true
    }
  },
  // Stage 3: Group by Court and Evidence Type
  {
    $group: {
      _id: {
        court: "$court_name",
        evidence_type: "$fir_details.evidence_items.item_type"
      },
      total_items: { $sum: 1 },
      distinct_cases: { $addToSet: "$case_number" }
    }
  },
  // Stage 4: Project structured analytical view
  {
    $project: {
      _id: 0,
      court: "$_id.court",
      evidence_type: "$_id.evidence_type",
      item_count: "$total_items",
      case_count: { $size: "$distinct_cases" },
      cases: "$distinct_cases"
    }
  },
  // Stage 5: Sort by volume
  {
    $sort: { item_count: -1 }
  }
]);
