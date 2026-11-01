import {
  Agent1Result,
  Agent2Result,
  Agent3Result,
  Agent4FinalResult,
  Agent4PlanResult,
  Agent5Result,
  Agent6Result,
  CalculatedKPIs,
  DistinctComment,
  PatientRecord,
} from '../types/agents';

// Central client-to-server call function invoking server-side callLLM
async function executeAgentCall<T>(prompt: string, data: any, agentId: string, agentName: string): Promise<T> {
  const response = await fetch('/api/llm/call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, data, agentId, agentName }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error ${response.status} running ${agentName}`);
  }

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || `Execution failed for ${agentName}`);
  }

  return json.result as T;
}

// ==========================================
// 1. AGENT 4: Orchestrator (Planning)
// ==========================================
export async function runAgent4Planning(
  managerQuestion: string,
  columns: string[],
  kpis: CalculatedKPIs
): Promise<{ prompt: string; data: any; result: Agent4PlanResult }> {
  const prompt = `AGENT 4 — ORCHESTRATOR (PLANNING)
Role: You are the hospital manager's lead agent. You plan the work and assign tasks.
You receive: the manager's question, the list of data columns, and the KPIs calculated by the app.
Steps:
1. Restate what the manager needs in one sentence.
2. Choose which specialists are needed: Feedback (1), Monitoring (2), Triage (3), Communication (6).
3. Write a one-sentence task for each chosen specialist. Give a reason for any you skip.
Rules: Do not analyze the data yourself.
Return strictly valid JSON in this format:
{
  "goal": "one-sentence restatement of what the manager needs",
  "agents": [
    {
      "agent": "Feedback",
      "run": true,
      "task": "one-sentence task for Feedback agent",
      "reason": "reason if run is false, or brief justification"
    },
    {
      "agent": "Monitoring",
      "run": true,
      "task": "one-sentence task for Monitoring agent",
      "reason": ""
    },
    {
      "agent": "Triage",
      "run": true,
      "task": "one-sentence task for Triage agent",
      "reason": ""
    },
    {
      "agent": "Communication",
      "run": true,
      "task": "one-sentence task for Communication agent",
      "reason": ""
    }
  ]
}`;

  const data = {
    manager_question: managerQuestion,
    data_columns: columns,
    calculated_kpis: {
      total_records: kpis.totalRecords,
      avg_satisfaction: kpis.avgSatisfaction,
      avg_communication_rating: kpis.avgCommunicationRating,
      followup_compliance_rate_pct: kpis.followupComplianceRate,
      portal_usage_rate_pct: kpis.portalUsageRate,
      satisfaction_by_service_line: kpis.satisfactionByServiceLine,
      satisfaction_by_year: kpis.satisfactionByYear,
      counts_by_readmission_risk: kpis.countsByReadmissionRisk,
      counts_by_ai_risk_flag: kpis.countsByAIRiskFlag,
    },
  };

  const result = await executeAgentCall<Agent4PlanResult>(
    prompt,
    data,
    'agent4_plan',
    'Agent 4 Orchestrator (Planning)'
  );

  return { prompt, data, result };
}

// ==========================================
// 2. AGENT 1: Patient Feedback
// ==========================================
export async function runAgent1Feedback(
  distinctComments: DistinctComment[],
  customTask?: string
): Promise<{ prompt: string; data: any; result: Agent1Result }> {
  const prompt = `AGENT 1 — PATIENT FEEDBACK
Role: You read patient comments to understand patient experience.
You receive: each distinct comment, its id, and how many records contain it.
${customTask ? `Special Manager Directive: ${customTask}` : ''}
Steps (for each comment):
1. Theme: choose exactly one from: Communication, Scheduling, Wait Time, Technology / Patient Portal, Billing, Clinical Care, Discharge / Follow-Up, Accessibility / Equity, or Mixed / Ambiguous.
2. Sentiment: Positive, Negative, Neutral, or Mixed.
3. Reason: one short sentence.
4. Operational issue: the process problem, or "None".
5. Risk concern: safety, accessibility, language, disability, fairness, or "None".
Rules: If a comment is unclear or mixed (for example, praise and criticism together), say so.
Return strictly valid JSON:
{
  "comments": [
    {
      "id": "C1",
      "theme": "Discharge / Follow-Up",
      "sentiment": "Negative",
      "reason": "Patient received conflicting instructions between discharge paperwork and nurse verbal advice.",
      "operational_issue": "Discharge medication reconciliation mismatch",
      "risk_concern": "safety"
    }
  ],
  "summary": "one or two sentence overall theme and sentiment synthesis"
}`;

  const data = distinctComments.map((c) => ({
    id: c.id,
    comment: c.comment,
    record_count: c.count,
  }));

  const result = await executeAgentCall<Agent1Result>(
    prompt,
    data,
    'agent1',
    'Agent 1 Patient Feedback'
  );

  return { prompt, data, result };
}

// ==========================================
// 3. AGENT 2: Patient Experience Monitoring
// ==========================================
export async function runAgent2Monitoring(
  kpis: CalculatedKPIs,
  customTask?: string
): Promise<{ prompt: string; data: any; result: Agent2Result }> {
  const prompt = `AGENT 2 — PATIENT EXPERIENCE MONITORING
Role: You look for patterns across patient groups and check for fairness and access problems.
You receive: averages and counts calculated by the app, grouped by Patient_Persona, Age_Group, Visit_Type, Service_Line, and Year (satisfaction, communication rating, follow-up rate, portal use, readmission risk, and comment counts).
${customTask ? `Special Manager Directive: ${customTask}` : ''}
Steps:
1. Find up to 3 patterns (for example, a service line or patient group with lower scores).
2. Find up to 3 equity or access concerns (older adults, rural, disabled, or limited English patients).
3. Rate risk as Low, Moderate, or High for patient safety, reputation, and equity.
4. Give one recommendation for managers.
Rules: Use the numbers you receive. If the differences between groups are small, say so instead of calling them a pattern.
Return strictly valid JSON:
{
  "patterns": [
    { "pattern": "...", "evidence": "..." }
  ],
  "equity_concerns": [
    { "group": "...", "concern": "...", "evidence": "..." }
  ],
  "risk": {
    "patient_safety": "Low",
    "reputation": "Moderate",
    "equity": "High"
  },
  "recommendation": "..."
}`;

  const data = {
    grouped_by_patient_persona: kpis.groupedAverages.byPersona,
    grouped_by_age_group: kpis.groupedAverages.byAgeGroup,
    grouped_by_visit_type: kpis.groupedAverages.byVisitType,
    grouped_by_service_line: kpis.groupedAverages.byServiceLine,
    grouped_by_year: kpis.groupedAverages.byYear,
    overall_readmission_risk_counts: kpis.countsByReadmissionRisk,
    overall_ai_risk_flag_counts: kpis.countsByAIRiskFlag,
  };

  const result = await executeAgentCall<Agent2Result>(
    prompt,
    data,
    'agent2',
    'Agent 2 Patient Experience Monitoring'
  );

  return { prompt, data, result };
}

// ==========================================
// 4. AGENT 3: Complaint Triage
// ==========================================
export async function runAgent3Triage(
  distinctComments: DistinctComment[],
  customTask?: string
): Promise<{ prompt: string; data: any; result: Agent3Result }> {
  const prompt = `AGENT 3 — COMPLAINT TRIAGE
Role: You sort complaints by how serious they are and who should handle them. You do not solve them.
You receive: each distinct comment, its id, how many records contain it, and the AI_Risk_Flag counts for those records.
${customTask ? `Special Manager Directive: ${customTask}` : ''}
Steps (for each comment):
1. Category: Communication, Scheduling, Wait Time, Technology / Patient Portal, Billing, Clinical Care, Patient Safety, Privacy, Staff Conduct, or Other.
2. Severity:
   1 Low = minor problem or positive comment
   2 Moderate = repeated problems or strong frustration
   3 High = possible harm, medication confusion, or serious access problem
   4 Critical = immediate safety risk, legal risk, privacy breach, or discrimination
3. Route to: Patient Experience Team, Nursing Leadership, Physician Leadership, Quality Improvement, Compliance Office, IT, Billing, Accessibility Coordinator, or Risk Management.
4. Human review: yes (true) if severity is 3 or 4, or the comment is unclear. Explain why.
Rules: Do not rely on the AI_Risk_Flag alone. Every record has a flag, so use it as one clue among others.
Return strictly valid JSON:
{
  "comments": [
    {
      "id": "C1",
      "category": "Patient Safety",
      "severity": 3,
      "severity_reason": "Conflicting blood thinner dosage instructions create direct threat of serious adverse drug event or hemorrhage.",
      "route_to": "Risk Management",
      "human_review": true,
      "review_reason": "Immediate clinical audit needed of discharge instruction reconciliation."
    }
  ],
  "summary": "Summary of triage distribution and human review triggers"
}`;

  const data = distinctComments.map((c) => ({
    id: c.id,
    comment: c.comment,
    record_count: c.count,
    ai_risk_flag_counts: c.riskFlagCounts,
  }));

  const result = await executeAgentCall<Agent3Result>(
    prompt,
    data,
    'agent3',
    'Agent 3 Complaint Triage'
  );

  return { prompt, data, result };
}

// ==========================================
// 5. AGENT 6: Communication Quality
// ==========================================
export async function runAgent6Communication(
  distinctComments: DistinctComment[],
  customTask?: string
): Promise<{ prompt: string; data: any; result: Agent6Result }> {
  const prompt = `AGENT 6 — COMMUNICATION QUALITY
Role: You find communication problems and show how the hospital could communicate better.
You receive: each distinct comment, its id, how many records contain it, and its average Communication_Rating.
${customTask ? `Special Manager Directive: ${customTask}` : ''}
Steps:
1. Pick the comments that describe a communication problem (instructions, conflicting information, interpreters, etc.).
2. For each one: what went wrong, the risk to patients (Low, Moderate, High), and one improvement.
3. For the biggest problem, write a short message the hospital could send to patients (80 words or fewer, simple words, about a 6th-grade reading level, kind and clear). Use [brackets] for details you do not have, such as [phone number].
Rules: Judge how clearly things are communicated, not whether the medicine is correct. Do not add medical facts.
Return strictly valid JSON:
{
  "problems": [
    {
      "id": "C1",
      "what_went_wrong": "Discharge instructions contradicted nurse verbal guidance on blood thinners.",
      "risk": "High",
      "improvement": "Provide a single verified discharge summary checklist co-signed by the nurse and patient."
    }
  ],
  "biggest_problem": "One-sentence description of the most urgent communication breakdown.",
  "improved_message": "Kind, clear sample patient message under 80 words at 6th-grade reading level with [brackets] for unknown details."
}`;

  const data = distinctComments.map((c) => ({
    id: c.id,
    comment: c.comment,
    record_count: c.count,
    average_communication_rating: c.avgCommunicationRating,
  }));

  const result = await executeAgentCall<Agent6Result>(
    prompt,
    data,
    'agent6',
    'Agent 6 Communication Quality'
  );

  return { prompt, data, result };
}

// ==========================================
// 6. AGENT 5: Analytics
// ==========================================
export async function runAgent5Analytics(
  kpis: CalculatedKPIs,
  specialistResults: {
    feedback?: Agent1Result | null;
    monitoring?: Agent2Result | null;
    triage?: Agent3Result | null;
    communication?: Agent6Result | null;
  },
  skippedAgents: string[]
): Promise<{ prompt: string; data: any; result: Agent5Result }> {
  const prompt = `AGENT 5 — ANALYTICS
Role: You turn the specialists' results into insights for hospital executives.
You receive: the KPIs calculated by the app and the approved results from the specialist agents.
Steps:
1. Write a one-sentence headline.
2. List 3 to 5 key findings with evidence (numbers or comment ids).
3. List hidden problems (for example, billing, wait times, portal failures, access for disabled patients).
4. Give the top 3 priorities, 2 quick wins (within 3 months), and 2 long-term AI ideas (6 to 12 months).
Rules: Use the KPI numbers exactly as given. If an agent was skipped, list it as a data gap.
Return strictly valid JSON:
{
  "headline": "one-sentence executive headline",
  "key_findings": ["finding 1 with evidence", "finding 2 with evidence", "finding 3 with evidence"],
  "hidden_problems": ["hidden problem 1", "hidden problem 2"],
  "priorities": ["priority 1", "priority 2", "priority 3"],
  "quick_wins": ["quick win 1 (under 3 mos)", "quick win 2 (under 3 mos)"],
  "ai_ideas": ["AI idea 1 (6-12 mos)", "AI idea 2 (6-12 mos)"],
  "data_gaps": ["any data gap or skipped agent note"]
}`;

  const data = {
    calculated_kpis: {
      total_records: kpis.totalRecords,
      avg_satisfaction: kpis.avgSatisfaction,
      avg_communication_rating: kpis.avgCommunicationRating,
      followup_compliance_rate_pct: kpis.followupComplianceRate,
      portal_usage_rate_pct: kpis.portalUsageRate,
      satisfaction_by_service_line: kpis.satisfactionByServiceLine,
      satisfaction_by_year: kpis.satisfactionByYear,
      counts_by_readmission_risk: kpis.countsByReadmissionRisk,
      counts_by_ai_risk_flag: kpis.countsByAIRiskFlag,
    },
    specialist_results: {
      feedback_agent_1: specialistResults.feedback || 'SKIPPED',
      monitoring_agent_2: specialistResults.monitoring || 'SKIPPED',
      triage_agent_3: specialistResults.triage || 'SKIPPED',
      communication_agent_6: specialistResults.communication || 'SKIPPED',
    },
    skipped_agents: skippedAgents,
  };

  const result = await executeAgentCall<Agent5Result>(
    prompt,
    data,
    'agent5',
    'Agent 5 Analytics'
  );

  return { prompt, data, result };
}

// ==========================================
// 7. AGENT 4: Orchestrator (Final Decision)
// ==========================================
export async function runAgent4FinalDecision(
  managerQuestion: string,
  plan: Agent4PlanResult,
  analytics: Agent5Result,
  humanReviewItems: Array<{ id: string; comment: string; count: number; category: string; severity: number; reason: string }>
): Promise<{ prompt: string; data: any; result: Agent4FinalResult }> {
  const prompt = `AGENT 4 — ORCHESTRATOR (FINAL DECISION)
Role: You make the final recommendation to the hospital manager.
You receive: the manager's question, your plan, the Analytics results, and the list of cases needing human review.
Steps:
1. Write the single most important management alert.
2. Answer the manager's question in 2 to 3 sentences.
3. Set the overall priority: Low, Medium, or High.
4. Give exactly 3 recommendations, each with an owner and a timeframe.
5. List what must go to human review and why.
Rules: Support the manager's decision; do not replace human judgment.
Return strictly valid JSON:
{
  "alert": "single most important management alert",
  "answer": "2 to 3 sentence direct answer to manager question",
  "priority": "High",
  "recommendations": [
    { "action": "Recommendation 1", "owner": "e.g. Chief Medical Officer / VP Nursing", "timeframe": "e.g. 30 Days" },
    { "action": "Recommendation 2", "owner": "e.g. Director of Patient Experience", "timeframe": "e.g. 60 Days" },
    { "action": "Recommendation 3", "owner": "e.g. VP Patient Access & IT", "timeframe": "e.g. 90 Days" }
  ],
  "human_review": [
    { "item": "Case / Issue Description", "reason": "Specific risk explanation" }
  ],
  "limitations": "Statement noting synthetic data constraints and need for clinical oversight."
}`;

  const data = {
    manager_question: managerQuestion,
    initial_plan: plan,
    analytics_insights: analytics,
    cases_needing_human_review: humanReviewItems,
  };

  const result = await executeAgentCall<Agent4FinalResult>(
    prompt,
    data,
    'agent4_final',
    'Agent 4 Orchestrator (Final Decision)'
  );

  return { prompt, data, result };
}
