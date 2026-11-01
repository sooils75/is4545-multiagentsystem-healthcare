export type AgentStatus = 'Pending' | 'Running' | 'Waiting for Review' | 'Completed' | 'Skipped' | 'Failed';

export type RunMode = 'auto' | 'step_by_step';

export type WorkflowStep = 1 | 2 | 3 | 4;

export interface PatientRecord {
  Record_ID: string;
  Patient_Persona: string;
  Age_Group: string;
  Visit_Type: string;
  Service_Line: string;
  Year: number;
  Patient_Satisfaction: number;
  Communication_Rating: number;
  Followup_Compliance: number; // 0 or 1
  Portal_Usage: number; // 0 or 1
  Readmission_Risk: 'Low' | 'Medium' | 'High';
  AI_Risk_Flag: 'None' | 'Moderate' | 'High' | 'Critical';
  Comment: string;
}

export interface DistinctComment {
  id: string; // e.g. "C1"
  comment: string;
  count: number;
  recordIds: string[];
  avgCommunicationRating: number;
  riskFlagCounts: Record<string, number>;
}

export interface CalculatedKPIs {
  totalRecords: number;
  avgSatisfaction: number;
  avgCommunicationRating: number;
  followupComplianceRate: number; // percentage (0 - 100)
  portalUsageRate: number; // percentage (0 - 100)
  satisfactionByServiceLine: Record<string, number>;
  satisfactionByYear: Record<string, number>;
  countsByReadmissionRisk: Record<string, number>;
  countsByAIRiskFlag: Record<string, number>;
  // Groupings for Agent 2:
  groupedAverages: {
    byPersona: Record<string, { satisfaction: number; communication: number; count: number; followUpRate: number; portalRate: number }>;
    byAgeGroup: Record<string, { satisfaction: number; communication: number; count: number; followUpRate: number; portalRate: number }>;
    byVisitType: Record<string, { satisfaction: number; communication: number; count: number; followUpRate: number; portalRate: number }>;
    byServiceLine: Record<string, { satisfaction: number; communication: number; count: number; followUpRate: number; portalRate: number }>;
    byYear: Record<string, { satisfaction: number; communication: number; count: number; followUpRate: number; portalRate: number }>;
  };
}

// Agent 4 (Planning) Output
export interface Agent4PlanItem {
  agent: 'Feedback' | 'Monitoring' | 'Triage' | 'Communication';
  run: boolean;
  task: string;
  reason?: string;
}

export interface Agent4PlanResult {
  goal: string;
  agents: Agent4PlanItem[];
}

// Agent 1 (Feedback) Output
export interface Agent1CommentResult {
  id: string;
  theme: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  reason: string;
  operational_issue: string;
  risk_concern: string;
}

export interface Agent1Result {
  comments: Agent1CommentResult[];
  summary: string;
}

// Agent 2 (Monitoring) Output
export interface Agent2Pattern {
  pattern: string;
  evidence: string;
}

export interface Agent2EquityConcern {
  group: string;
  concern: string;
  evidence: string;
}

export interface Agent2Result {
  patterns: Agent2Pattern[];
  equity_concerns: Agent2EquityConcern[];
  risk: {
    patient_safety: 'Low' | 'Moderate' | 'High';
    reputation: 'Low' | 'Moderate' | 'High';
    equity: 'Low' | 'Moderate' | 'High';
  };
  recommendation: string;
}

// Agent 3 (Triage) Output
export interface Agent3CommentResult {
  id: string;
  category: string;
  severity: 1 | 2 | 3 | 4;
  severity_reason: string;
  route_to: string;
  human_review: boolean;
  review_reason: string;
}

export interface Agent3Result {
  comments: Agent3CommentResult[];
  summary: string;
}

// Agent 6 (Communication) Output
export interface Agent6Problem {
  id: string;
  what_went_wrong: string;
  risk: 'Low' | 'Moderate' | 'High';
  improvement: string;
}

export interface Agent6Result {
  problems: Agent6Problem[];
  biggest_problem: string;
  improved_message: string;
}

// Agent 5 (Analytics) Output
export interface Agent5Result {
  headline: string;
  key_findings: string[];
  hidden_problems: string[];
  priorities: string[];
  quick_wins: string[];
  ai_ideas: string[];
  data_gaps: string[];
}

// Agent 4 (Final Decision) Output
export interface Agent4Recommendation {
  action: string;
  owner: string;
  timeframe: string;
}

export interface Agent4HumanReviewItem {
  item: string;
  reason: string;
}

export interface Agent4FinalResult {
  alert: string;
  answer: string;
  priority: 'Low' | 'Medium' | 'High';
  recommendations: Agent4Recommendation[];
  human_review: Agent4HumanReviewItem[];
  limitations: string;
}

export interface AgentState {
  id: 'agent4_plan' | 'agent1' | 'agent2' | 'agent3' | 'agent6' | 'agent5' | 'agent4_final';
  number: number;
  name: string;
  codeName: string;
  roleDescription: string;
  status: AgentStatus;
  accentColor: string;
  badgeBg: string;
  inputData: any;
  outputResult: any;
  customTask?: string;
  enabledInPlan?: boolean;
  error?: string;
}
