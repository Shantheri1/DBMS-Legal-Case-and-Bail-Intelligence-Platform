import fs from 'fs';
import path from 'path';

export interface CaseRecord {
  id: number;
  caseNumber: string;
  title: string;
  court: string;
  accused: string;
  filingDate: string;
  priority: string;
  status: string; // 'BAIL_PENDING' | 'BAIL_GRANTED' | 'BAIL_REJECTED' | 'HEARING_IN_PROGRESS' | 'FILED'
  charges: string;
  lastAdjudication?: {
    decision: string;
    decisionDate: string;
    suretyAmount: number;
    reasoning: string;
    judgeName: string;
  };
}

export interface BailPetitionRecord {
  bailId: number;
  caseId: number;
  caseNumber: string;
  caseTitle: string;
  applicantName: string;
  courtName: string;
  bailType: string;
  grounds: string;
  custodyDays: number;
  riskScore: number;
  status: 'PENDING' | 'GRANTED' | 'REJECTED';
  appliedDate: string;
  appliedByAdvocate?: string;
  decision?: string;
  decisionDate?: string;
  suretyAmount?: number;
  reasoning?: string;
  adjudicatedByJudge?: string;
}

const STATE_FILE_PATH = path.join(process.cwd(), 'database', 'case_store_state.json');

const INITIAL_CASES: CaseRecord[] = [
  {
    id: 1,
    caseNumber: 'CNR-KA-BLR-2026-00101',
    title: 'State of Karnataka v. Vikram Malhotra',
    court: 'City Civil and Sessions Court Bengaluru',
    accused: 'Vikram Malhotra',
    filingDate: '2026-09-15',
    priority: 'URGENT',
    status: 'BAIL_PENDING',
    charges: 'IPC Sec 420, IT Act Sec 66D',
  },
  {
    id: 2,
    caseNumber: 'CNR-KA-BLR-2026-00204',
    title: 'Rahul Verma v. Priya Deshmukh',
    court: 'City Civil and Sessions Court Bengaluru',
    accused: 'Priya Deshmukh',
    filingDate: '2026-10-02',
    priority: 'STANDARD',
    status: 'HEARING_IN_PROGRESS',
    charges: 'IPC Sec 406 (Breach of Trust)',
  },
  {
    id: 3,
    caseNumber: 'CNR-KA-BLR-2026-00318',
    title: 'State v. Mahesh Patil',
    court: 'Chief Metropolitan Magistrate Court Bengaluru',
    accused: 'Mahesh Patil',
    filingDate: '2026-10-18',
    priority: 'LOW',
    status: 'FILED',
    charges: 'IPC Sec 323 (Affray / Simple Hurt)',
  },
];

const INITIAL_PETITIONS: BailPetitionRecord[] = [
  {
    bailId: 1,
    caseId: 1,
    caseNumber: 'CNR-KA-BLR-2026-00101',
    caseTitle: 'State of Karnataka v. Vikram Malhotra (Sec 420 IPC, 66D IT Act)',
    applicantName: 'Vikram Malhotra',
    courtName: 'City Civil and Sessions Court Bengaluru',
    bailType: 'REGULAR',
    grounds: 'Applicant in custody for 45 days. Complete charge sheet filed; digital evidence frozen. Clean antecedents and deep local roots in Bengaluru.',
    custodyDays: 45,
    riskScore: 35.0,
    status: 'PENDING',
    appliedDate: '2026-10-20',
    appliedByAdvocate: 'Adv. Shantheni Shenoy (BCI/KA/428)',
  },
  {
    bailId: 2,
    caseId: 2,
    caseNumber: 'CNR-KA-BLR-2026-00204',
    caseTitle: 'Rahul Verma v. Priya Deshmukh (Sec 406 IPC)',
    applicantName: 'Priya Deshmukh',
    courtName: 'City Civil and Sessions Court Bengaluru',
    bailType: 'ANTICIPATORY',
    grounds: 'Commercial dispute arising from escrow partnership. Dispute is civil in nature; applicant fully cooperating with investigation.',
    custodyDays: 0,
    riskScore: 20.0,
    status: 'PENDING',
    appliedDate: '2026-10-25',
    appliedByAdvocate: 'Adv. Shriranjini Kumar (BCI/KA/447)',
  },
];

interface StoreState {
  cases: CaseRecord[];
  petitions: BailPetitionRecord[];
}

function loadState(): StoreState {
  try {
    if (fs.existsSync(STATE_FILE_PATH)) {
      const data = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed.cases && parsed.petitions) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read case store state, using defaults:', err);
  }

  // Initialize and persist defaults
  const defaultState: StoreState = {
    cases: INITIAL_CASES,
    petitions: INITIAL_PETITIONS,
  };
  saveState(defaultState);
  return defaultState;
}

function saveState(state: StoreState): void {
  try {
    const dir = path.dirname(STATE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write case store state:', err);
  }
}

// Global in-memory cache synchronized with disk
let memoryState: StoreState = loadState();

export function getCases(): CaseRecord[] {
  memoryState = loadState();
  return memoryState.cases;
}

export function getAllBailPetitions(): BailPetitionRecord[] {
  memoryState = loadState();
  return memoryState.petitions;
}

export function getPendingBailPetitions(): BailPetitionRecord[] {
  memoryState = loadState();
  return memoryState.petitions.filter((p) => p.status === 'PENDING');
}

export function getAdjudicatedBailPetitions(): BailPetitionRecord[] {
  memoryState = loadState();
  return memoryState.petitions.filter((p) => p.status !== 'PENDING');
}

export function applyForBail(petition: {
  caseNumber: string;
  appliedByAdvocate: string;
  bailType: string;
  custodyDays: number;
  grounds: string;
  riskScore: number;
}): BailPetitionRecord {
  memoryState = loadState();

  const targetCase = memoryState.cases.find((c) => c.caseNumber === petition.caseNumber);
  const newBailId = memoryState.petitions.length > 0 
    ? Math.max(...memoryState.petitions.map((p) => p.bailId)) + 1 
    : 101;

  const newPetition: BailPetitionRecord = {
    bailId: newBailId,
    caseId: targetCase ? targetCase.id : 1,
    caseNumber: petition.caseNumber,
    caseTitle: targetCase ? `${targetCase.title} (${targetCase.charges})` : petition.caseNumber,
    applicantName: targetCase ? targetCase.accused : 'Applicant',
    courtName: targetCase ? targetCase.court : 'City Civil and Sessions Court Bengaluru',
    bailType: petition.bailType,
    grounds: petition.grounds,
    custodyDays: petition.custodyDays,
    riskScore: petition.riskScore,
    status: 'PENDING',
    appliedDate: new Date().toISOString().split('T')[0],
    appliedByAdvocate: petition.appliedByAdvocate,
  };

  memoryState.petitions.unshift(newPetition);

  // Update target case status to BAIL_PENDING
  if (targetCase) {
    targetCase.status = 'BAIL_PENDING';
  }

  saveState(memoryState);
  return newPetition;
}

export function adjudicateBail(
  bailId: number,
  decision: 'GRANTED' | 'REJECTED' | 'CONDITIONAL_RELEASE',
  reasoning: string,
  suretyAmount: number,
  judgeName: string = 'Hon. Justice Rajesh Sharma'
): { success: boolean; petition?: BailPetitionRecord; caseRecord?: CaseRecord } {
  memoryState = loadState();

  const petition = memoryState.petitions.find((p) => p.bailId === Number(bailId));
  if (!petition) {
    return { success: false };
  }

  const decisionDate = new Date().toISOString().split('T')[0];
  const finalStatus = (decision === 'GRANTED' || decision === 'CONDITIONAL_RELEASE') ? 'GRANTED' : 'REJECTED';

  petition.status = finalStatus;
  petition.decision = decision;
  petition.decisionDate = decisionDate;
  petition.suretyAmount = suretyAmount;
  petition.reasoning = reasoning;
  petition.adjudicatedByJudge = judgeName;

  // Trigger synchronization: Update parent case status
  const caseRecord = memoryState.cases.find((c) => c.caseNumber === petition.caseNumber || c.id === petition.caseId);
  if (caseRecord) {
    caseRecord.status = finalStatus === 'GRANTED' ? 'BAIL_GRANTED' : 'BAIL_REJECTED';
    caseRecord.lastAdjudication = {
      decision: finalStatus,
      decisionDate,
      suretyAmount,
      reasoning,
      judgeName,
    };
  }

  saveState(memoryState);
  return { success: true, petition, caseRecord };
}

export function createCase(newCase: {
  caseNumber: string;
  title: string;
  court?: string;
  accused: string;
  charges?: string;
  priority?: string;
}): CaseRecord {
  memoryState = loadState();

  const nextId = memoryState.cases.length > 0
    ? Math.max(...memoryState.cases.map((c) => c.id)) + 1
    : 1;

  const caseItem: CaseRecord = {
    id: nextId,
    caseNumber: newCase.caseNumber.trim().toUpperCase(),
    title: newCase.title.trim(),
    court: newCase.court?.trim() || 'City Civil and Sessions Court Bengaluru',
    accused: newCase.accused.trim(),
    filingDate: new Date().toISOString().split('T')[0],
    priority: newCase.priority || 'STANDARD',
    status: 'FILED',
    charges: newCase.charges?.trim() || 'IPC Sec 420',
  };

  memoryState.cases.push(caseItem);
  saveState(memoryState);
  return caseItem;
}
