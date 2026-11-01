import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Papa from 'papaparse';
import {
  Agent1Result,
  Agent2Result,
  Agent3Result,
  Agent4FinalResult,
  Agent4PlanResult,
  Agent5Result,
  Agent6Result,
  AgentState,
  CalculatedKPIs,
  DistinctComment,
  PatientRecord,
  RunMode,
  WorkflowStep,
} from './types/agents';
import {
  convertRecordsToCSV,
  INITIAL_PATIENT_RECORDS,
} from './data/sampleDataset';
import { calculateKPIs, extractDistinctComments } from './utils/analytics';
import {
  runAgent1Feedback,
  runAgent2Monitoring,
  runAgent3Triage,
  runAgent4FinalDecision,
  runAgent4Planning,
  runAgent5Analytics,
  runAgent6Communication,
} from './services/agentWorkflow';
import { Header } from './components/Header';
import { ManagerQuestionBar } from './components/ManagerQuestionBar';
import { AgentDiagram } from './components/AgentDiagram';
import { StepReviewBar } from './components/StepReviewBar';
import { AgentDetailModal } from './components/AgentDetailModal';
import { DashboardView } from './components/DashboardView';
import { DataTable } from './components/DataTable';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Database,
  Info,
  LayoutDashboard,
  Network,
  Sparkles,
  X,
} from 'lucide-react';
import { parseUploadedFile } from './utils/fileParser';

const INITIAL_AGENTS_CONFIG: Record<string, AgentState> = {
  agent4_plan: {
    id: 'agent4_plan',
    number: 1,
    name: 'Orchestrator (Planning)',
    codeName: 'Agent 4',
    roleDescription: 'Plans the multi-agent investigation, formulates goal, and assigns specialist tasks.',
    status: 'Pending',
    accentColor: 'bg-indigo-600',
    badgeBg: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300',
    inputData: null,
    outputResult: null,
  },
  agent1: {
    id: 'agent1',
    number: 2,
    name: 'Patient Feedback',
    codeName: 'Agent 1',
    roleDescription: 'Analyzes patient comments for themes, sentiment, operational defects, and safety risks.',
    status: 'Pending',
    accentColor: 'bg-emerald-600',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
    inputData: null,
    outputResult: null,
    enabledInPlan: true,
  },
  agent2: {
    id: 'agent2',
    number: 2,
    name: 'Experience Monitoring',
    codeName: 'Agent 2',
    roleDescription: 'Identifies demographic patterns, equity barriers, and rates safety/reputation risks.',
    status: 'Pending',
    accentColor: 'bg-amber-600',
    badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300',
    inputData: null,
    outputResult: null,
    enabledInPlan: true,
  },
  agent3: {
    id: 'agent3',
    number: 2,
    name: 'Complaint Triage',
    codeName: 'Agent 3',
    roleDescription: 'Categorizes complaints, assigns severity 1-4, routes to leadership, and flags human review.',
    status: 'Pending',
    accentColor: 'bg-rose-600',
    badgeBg: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300',
    inputData: null,
    outputResult: null,
    enabledInPlan: true,
  },
  agent6: {
    id: 'agent6',
    number: 2,
    name: 'Communication Quality',
    codeName: 'Agent 6',
    roleDescription: 'Finds communication breakdowns and drafts an improved 6th-grade level patient message.',
    status: 'Pending',
    accentColor: 'bg-sky-600',
    badgeBg: 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300',
    inputData: null,
    outputResult: null,
    enabledInPlan: true,
  },
  agent5: {
    id: 'agent5',
    number: 3,
    name: 'Executive Analytics',
    codeName: 'Agent 5',
    roleDescription: 'Synthesizes specialist findings, priorities, quick wins, and long-term AI ideas.',
    status: 'Pending',
    accentColor: 'bg-purple-600',
    badgeBg: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300',
    inputData: null,
    outputResult: null,
  },
  agent4_final: {
    id: 'agent4_final',
    number: 4,
    name: 'Orchestrator (Final Decision)',
    codeName: 'Agent 4',
    roleDescription: 'Delivers executive alert, answers manager question, and assigns owners/timeframes.',
    status: 'Pending',
    accentColor: 'bg-teal-700',
    badgeBg: 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300',
    inputData: null,
    outputResult: null,
  },
};

export default function App() {
  // Theme state (dark / light)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hospital_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('hospital_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Dataset and records
  const [records, setRecords] = useState<PatientRecord[]>(INITIAL_PATIENT_RECORDS);
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(
    () => new Set(INITIAL_PATIENT_RECORDS.map((r) => r.Record_ID))
  );

  // Workflow configuration
  const [managerQuestion, setManagerQuestion] = useState(
    'What should management fix first to improve patient experience, and which cases need human review?'
  );
  const [runMode, setRunMode] = useState<RunMode>('auto');
  const [activeTab, setActiveTab] = useState<'workflow' | 'dashboard' | 'records'>('workflow');

  // Multi-agent execution state
  const [agents, setAgents] = useState<Record<string, AgentState>>(INITIAL_AGENTS_CONFIG);
  const [activeStep, setActiveStep] = useState<WorkflowStep | null>(null);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);
  const [stepLabel, setStepLabel] = useState<string>('');
  const [selectedAgentModalId, setSelectedAgentModalId] = useState<string | null>(null);

  // In-app notifications and Vercel/Server environment health
  const [notification, setNotification] = useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
    details?: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data?.hasKey) {
          setNotification({
            type: 'warning',
            message: 'GEMINI_API_KEY is not configured in this environment',
            details:
              'If you deployed on Vercel: Open Vercel Dashboard -> Project Settings -> Environment Variables, add GEMINI_API_KEY, and Redeploy.',
          });
        }
      })
      .catch((err) => {
        console.warn('API health check error:', err);
      });
  }, []);

  // Computed dataset numbers via pure JavaScript
  const activeRecords = useMemo(() => {
    return records.filter((r) => selectedRecordIds.has(r.Record_ID));
  }, [records, selectedRecordIds]);

  const kpis: CalculatedKPIs = useMemo(() => {
    return calculateKPIs(activeRecords);
  }, [activeRecords]);

  const distinctComments: DistinctComment[] = useMemo(() => {
    return extractDistinctComments(activeRecords);
  }, [activeRecords]);

  const dataColumns = useMemo(() => {
    if (records.length === 0) return [];
    return Object.keys(records[0]);
  }, [records]);

  // Record selection handlers
  const handleToggleRecord = useCallback((id: string) => {
    setSelectedRecordIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedRecordIds((prev) => {
      if (prev.size === records.length) {
        return new Set();
      } else {
        return new Set(records.map((r) => r.Record_ID));
      }
    });
  }, [records]);

  // Universal File Upload handler (CSV, TSV, TXT, JSON)
  const handleUploadCSV = async (file: File) => {
    try {
      const res = await parseUploadedFile(file);
      if (!res.success || res.records.length === 0) {
        setNotification({
          type: 'error',
          message: `Could not parse ${file.name}`,
          details: res.message,
        });
        return;
      }

      setRecords(res.records);
      setSelectedRecordIds(new Set(res.records.map((r) => r.Record_ID)));
      setAgents(INITIAL_AGENTS_CONFIG);
      setActiveStep(null);
      setWaitingForApproval(false);

      setNotification({
        type: 'success',
        message: `Successfully loaded ${res.records.length} records from ${file.name}`,
        details: `Detected columns: ${res.detectedColumns.slice(0, 6).join(', ')}${
          res.detectedColumns.length > 6 ? '...' : ''
        }`,
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Error reading file ${file.name}`,
        details: err?.message || 'Unknown parsing error',
      });
    }
  };

  const handleLoadSampleData = () => {
    setRecords(INITIAL_PATIENT_RECORDS);
    setSelectedRecordIds(new Set(INITIAL_PATIENT_RECORDS.map((r) => r.Record_ID)));
    setAgents(INITIAL_AGENTS_CONFIG);
    setActiveStep(null);
    setWaitingForApproval(false);
    setNotification({
      type: 'info',
      message: 'Loaded standard 60-patient benchmark dataset',
      details: '8 distinct recurring comment themes across 4 hospital departments.',
    });
  };

  const handleDownloadCSV = () => {
    const csvContent = convertRecordsToCSV(records);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'hospital_patient_experience_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Plan customization handler in Step-by-Step review
  const handleUpdatePlanItem = (
    agentKey: 'Feedback' | 'Monitoring' | 'Triage' | 'Communication',
    run: boolean,
    task: string
  ) => {
    const keyToId: Record<string, string> = {
      Feedback: 'agent1',
      Monitoring: 'agent2',
      Triage: 'agent3',
      Communication: 'agent6',
    };
    const agentId = keyToId[agentKey];

    setAgents((prev) => {
      const planResult: Agent4PlanResult = prev.agent4_plan.outputResult;
      const updatedAgents = (planResult?.agents || []).map((a) => {
        if (a.agent === agentKey) {
          return { ...a, run, task };
        }
        return a;
      });

      return {
        ...prev,
        agent4_plan: {
          ...prev.agent4_plan,
          outputResult: planResult ? { ...planResult, agents: updatedAgents } : null,
        },
        [agentId]: {
          ...prev[agentId],
          status: run ? 'Pending' : 'Skipped',
          customTask: task,
          enabledInPlan: run,
        },
      };
    });
  };

  // Helper to update agent status and results safely
  const updateAgentState = (
    agentId: string,
    updates: Partial<AgentState>
  ) => {
    setAgents((prev) => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        ...updates,
      },
    }));
  };

  // ==========================================
  // WORKFLOW RUNNER IMPLEMENTATION
  // ==========================================

  // Step 1: Agent 4 Planning
  const executeStep1 = async (): Promise<Agent4PlanResult> => {
    setActiveStep(1);
    setStepLabel('Step 1: Agent 4 Planning...');
    setRunningAgentId('agent4_plan');
    updateAgentState('agent4_plan', { status: 'Running', error: undefined });

    try {
      const { data, result } = await runAgent4Planning(
        managerQuestion,
        dataColumns,
        kpis
      );

      const agentMap: Record<string, string> = {
        Feedback: 'agent1',
        Monitoring: 'agent2',
        Triage: 'agent3',
        Communication: 'agent6',
      };

      setAgents((prev) => {
        const next = { ...prev };
        next.agent4_plan = {
          ...next.agent4_plan,
          status: 'Completed',
          inputData: data,
          outputResult: result,
        };

        for (const item of result.agents || []) {
          const aid = agentMap[item.agent];
          if (aid && next[aid]) {
            next[aid] = {
              ...next[aid],
              status: item.run ? 'Pending' : 'Skipped',
              customTask: item.task,
              enabledInPlan: item.run,
            };
          }
        }
        return next;
      });

      setRunningAgentId(null);
      return result;
    } catch (err: any) {
      updateAgentState('agent4_plan', {
        status: 'Failed',
        error: err.message || 'Planning step failed',
      });
      setRunningAgentId(null);
      throw err;
    }
  };

  // Step 2: Specialists 1, 2, 3, 6 Concurrent Execution
  const executeStep2 = async (currentPlan: Agent4PlanResult) => {
    setActiveStep(2);
    setStepLabel('Step 2: Concurrent Specialists...');
    setRunningAgentId('step2_parallel');

    const promises: Promise<any>[] = [];

    // 1. Agent 1 Feedback
    const p1 = currentPlan.agents?.find((a) => a.agent === 'Feedback');
    const shouldRun1 = p1 ? p1.run : true;
    if (shouldRun1 && agents.agent1.status !== 'Completed') {
      updateAgentState('agent1', { status: 'Running', error: undefined });
      promises.push(
        runAgent1Feedback(distinctComments, agents.agent1.customTask || p1?.task)
          .then(({ data, result }) => {
            updateAgentState('agent1', {
              status: 'Completed',
              inputData: data,
              outputResult: result,
            });
          })
          .catch((err) => {
            updateAgentState('agent1', {
              status: 'Failed',
              error: err.message,
            });
          })
      );
    } else if (!shouldRun1) {
      updateAgentState('agent1', { status: 'Skipped' });
    }

    // 2. Agent 2 Monitoring
    const p2 = currentPlan.agents?.find((a) => a.agent === 'Monitoring');
    const shouldRun2 = p2 ? p2.run : true;
    if (shouldRun2 && agents.agent2.status !== 'Completed') {
      updateAgentState('agent2', { status: 'Running', error: undefined });
      promises.push(
        runAgent2Monitoring(kpis, agents.agent2.customTask || p2?.task)
          .then(({ data, result }) => {
            updateAgentState('agent2', {
              status: 'Completed',
              inputData: data,
              outputResult: result,
            });
          })
          .catch((err) => {
            updateAgentState('agent2', {
              status: 'Failed',
              error: err.message,
            });
          })
      );
    } else if (!shouldRun2) {
      updateAgentState('agent2', { status: 'Skipped' });
    }

    // 3. Agent 3 Triage
    const p3 = currentPlan.agents?.find((a) => a.agent === 'Triage');
    const shouldRun3 = p3 ? p3.run : true;
    if (shouldRun3 && agents.agent3.status !== 'Completed') {
      updateAgentState('agent3', { status: 'Running', error: undefined });
      promises.push(
        runAgent3Triage(distinctComments, agents.agent3.customTask || p3?.task)
          .then(({ data, result }) => {
            updateAgentState('agent3', {
              status: 'Completed',
              inputData: data,
              outputResult: result,
            });
          })
          .catch((err) => {
            updateAgentState('agent3', {
              status: 'Failed',
              error: err.message,
            });
          })
      );
    } else if (!shouldRun3) {
      updateAgentState('agent3', { status: 'Skipped' });
    }

    // 4. Agent 6 Communication
    const p6 = currentPlan.agents?.find((a) => a.agent === 'Communication');
    const shouldRun6 = p6 ? p6.run : true;
    if (shouldRun6 && agents.agent6.status !== 'Completed') {
      updateAgentState('agent6', { status: 'Running', error: undefined });
      promises.push(
        runAgent6Communication(distinctComments, agents.agent6.customTask || p6?.task)
          .then(({ data, result }) => {
            updateAgentState('agent6', {
              status: 'Completed',
              inputData: data,
              outputResult: result,
            });
          })
          .catch((err) => {
            updateAgentState('agent6', {
              status: 'Failed',
              error: err.message,
            });
          })
      );
    } else if (!shouldRun6) {
      updateAgentState('agent6', { status: 'Skipped' });
    }

    await Promise.all(promises);
    setRunningAgentId(null);
  };

  // Step 3: Agent 5 Analytics Execution
  const executeStep3 = async (): Promise<Agent5Result> => {
    setActiveStep(3);
    setStepLabel('Step 3: Executive Analytics...');
    setRunningAgentId('agent5');
    updateAgentState('agent5', { status: 'Running', error: undefined });

    const skippedAgents: string[] = [];
    if (agents.agent1.status === 'Skipped') skippedAgents.push('Agent 1 (Patient Feedback)');
    if (agents.agent2.status === 'Skipped') skippedAgents.push('Agent 2 (Monitoring)');
    if (agents.agent3.status === 'Skipped') skippedAgents.push('Agent 3 (Triage)');
    if (agents.agent6.status === 'Skipped') skippedAgents.push('Agent 6 (Communication)');

    try {
      const { data, result } = await runAgent5Analytics(
        kpis,
        {
          feedback: agents.agent1.outputResult,
          monitoring: agents.agent2.outputResult,
          triage: agents.agent3.outputResult,
          communication: agents.agent6.outputResult,
        },
        skippedAgents
      );

      updateAgentState('agent5', {
        status: 'Completed',
        inputData: data,
        outputResult: result,
      });

      setRunningAgentId(null);
      return result;
    } catch (err: any) {
      updateAgentState('agent5', {
        status: 'Failed',
        error: err.message || 'Analytics synthesis failed',
      });
      setRunningAgentId(null);
      throw err;
    }
  };

  // Step 4: Agent 4 Final Decision Execution
  const executeStep4 = async (analyticsResult: Agent5Result) => {
    setActiveStep(4);
    setStepLabel('Step 4: Final Executive Decision...');
    setRunningAgentId('agent4_final');
    updateAgentState('agent4_final', { status: 'Running', error: undefined });

    const triageData: Agent3Result | null = agents.agent3.outputResult;
    const humanReviewItems = (triageData?.comments || [])
      .filter((c) => c.human_review)
      .map((c) => {
        const dc = distinctComments.find((d) => d.id === c.id);
        return {
          id: c.id,
          comment: dc?.comment || '',
          count: dc?.count || 1,
          category: c.category,
          severity: c.severity,
          reason: c.review_reason || c.severity_reason,
        };
      });

    try {
      const planData: Agent4PlanResult = agents.agent4_plan.outputResult;
      const { data, result } = await runAgent4FinalDecision(
        managerQuestion,
        planData,
        analyticsResult,
        humanReviewItems
      );

      updateAgentState('agent4_final', {
        status: 'Completed',
        inputData: data,
        outputResult: result,
      });

      setRunningAgentId(null);
      setIsRunning(false);
      setWaitingForApproval(false);
      setStepLabel('Completed');
      setActiveTab('dashboard');
    } catch (err: any) {
      updateAgentState('agent4_final', {
        status: 'Failed',
        error: err.message || 'Final decision generation failed',
      });
      setRunningAgentId(null);
      setIsRunning(false);
      throw err;
    }
  };

  // Full workflow trigger
  const handleRunWorkflow = async () => {
    if (activeRecords.length === 0) {
      setNotification({
        type: 'warning',
        message: 'No patient records selected',
        details: 'Please select at least one record from the dataset table to analyze.',
      });
      return;
    }

    setIsRunning(true);
    setWaitingForApproval(false);

    try {
      // STEP 1
      const plan = await executeStep1();

      if (runMode === 'step_by_step') {
        setWaitingForApproval(true);
        setIsRunning(false);
        return;
      }

      // AUTO RUN MODE CONTINUES:
      // STEP 2
      await executeStep2(plan);

      // STEP 3
      const analytics = await executeStep3();

      // STEP 4
      await executeStep4(analytics);
    } catch (err: any) {
      console.error('Workflow execution error:', err);
      setIsRunning(false);

      const errMsg = err?.message || 'Execution error';
      const isApiKeyIssue = errMsg.includes('GEMINI_API_KEY') || errMsg.includes('API key');
      const isHtmlResponse = errMsg.includes('Unexpected token') || errMsg.includes('JSON');

      setNotification({
        type: 'error',
        message: isApiKeyIssue
          ? 'Missing GEMINI_API_KEY on Vercel'
          : isHtmlResponse
          ? 'API Route Configuration Error'
          : 'Workflow Execution Failed',
        details: isApiKeyIssue
          ? 'Vercel requires the GEMINI_API_KEY environment variable. Open Vercel Dashboard -> Project Settings -> Environment Variables, add GEMINI_API_KEY, and Redeploy.'
          : isHtmlResponse
          ? 'The serverless API route did not return JSON. Ensure vercel.json and the /api directory are included in your GitHub repository.'
          : errMsg,
      });
    }
  };

  // Continue to next step in Step-by-Step mode
  const handleApproveAndContinue = async () => {
    if (!activeStep) return;
    setIsRunning(true);
    setWaitingForApproval(false);

    try {
      if (activeStep === 1) {
        const plan: Agent4PlanResult = agents.agent4_plan.outputResult;
        await executeStep2(plan);
        setActiveStep(2);
        setWaitingForApproval(true);
        setIsRunning(false);
      } else if (activeStep === 2) {
        const analytics = await executeStep3();
        setActiveStep(3);
        setWaitingForApproval(true);
        setIsRunning(false);
      } else if (activeStep === 3) {
        const analytics = agents.agent5.outputResult;
        await executeStep4(analytics);
      }
    } catch (err) {
      console.error('Approval advancement error:', err);
      setIsRunning(false);
    }
  };

  // Re-run an individual agent without repeating finished agents
  const handleRerunIndividualAgent = async (agentId: string) => {
    setRunningAgentId(agentId);
    updateAgentState(agentId, { status: 'Running', error: undefined });

    try {
      switch (agentId) {
        case 'agent4_plan': {
          const { data, result } = await runAgent4Planning(
            managerQuestion,
            dataColumns,
            kpis
          );
          updateAgentState('agent4_plan', {
            status: 'Completed',
            inputData: data,
            outputResult: result,
          });
          break;
        }
        case 'agent1': {
          const { data, result } = await runAgent1Feedback(
            distinctComments,
            agents.agent1.customTask
          );
          updateAgentState('agent1', {
            status: 'Completed',
            inputData: data,
            outputResult: result,
          });
          break;
        }
        case 'agent2': {
          const { data, result } = await runAgent2Monitoring(
            kpis,
            agents.agent2.customTask
          );
          updateAgentState('agent2', {
            status: 'Completed',
            inputData: data,
            outputResult: result,
          });
          break;
        }
        case 'agent3': {
          const { data, result } = await runAgent3Triage(
            distinctComments,
            agents.agent3.customTask
          );
          updateAgentState('agent3', {
            status: 'Completed',
            inputData: data,
            outputResult: result,
          });
          break;
        }
        case 'agent6': {
          const { data, result } = await runAgent6Communication(
            distinctComments,
            agents.agent6.customTask
          );
          updateAgentState('agent6', {
            status: 'Completed',
            inputData: data,
            outputResult: result,
          });
          break;
        }
        case 'agent5': {
          const skippedAgents: string[] = [];
          if (agents.agent1.status === 'Skipped') skippedAgents.push('Feedback');
          if (agents.agent2.status === 'Skipped') skippedAgents.push('Monitoring');
          if (agents.agent3.status === 'Skipped') skippedAgents.push('Triage');
          if (agents.agent6.status === 'Skipped') skippedAgents.push('Communication');

          const { data, result } = await runAgent5Analytics(
            kpis,
            {
              feedback: agents.agent1.outputResult,
              monitoring: agents.agent2.outputResult,
              triage: agents.agent3.outputResult,
              communication: agents.agent6.outputResult,
            },
            skippedAgents
          );
          updateAgentState('agent5', {
            status: 'Completed',
            inputData: data,
            outputResult: result,
          });
          break;
        }
        case 'agent4_final': {
          const triageData: Agent3Result | null = agents.agent3.outputResult;
          const humanReviewItems = (triageData?.comments || [])
            .filter((c) => c.human_review)
            .map((c) => {
              const dc = distinctComments.find((d) => d.id === c.id);
              return {
                id: c.id,
                comment: dc?.comment || '',
                count: dc?.count || 1,
                category: c.category,
                severity: c.severity,
                reason: c.review_reason || c.severity_reason,
              };
            });
          const { data, result } = await runAgent4FinalDecision(
            managerQuestion,
            agents.agent4_plan.outputResult,
            agents.agent5.outputResult,
            humanReviewItems
          );
          updateAgentState('agent4_final', {
            status: 'Completed',
            inputData: data,
            outputResult: result,
          });
          break;
        }
      }
    } catch (err: any) {
      updateAgentState(agentId, {
        status: 'Failed',
        error: err.message || 'Agent execution failed',
      });
    } finally {
      setRunningAgentId(null);
    }
  };

  const handleResetWorkflow = () => {
    setAgents(INITIAL_AGENTS_CONFIG);
    setActiveStep(null);
    setWaitingForApproval(false);
    setIsRunning(false);
    setRunningAgentId(null);
    setStepLabel('');
  };

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col transition-colors duration-200">
      {/* HEADER WITH THEME TOGGLE */}
      <Header
        runMode={runMode}
        onChangeRunMode={setRunMode}
        isRunning={isRunning}
        onRunWorkflow={handleRunWorkflow}
        onResetWorkflow={handleResetWorkflow}
        onUploadCSV={handleUploadCSV}
        onLoadSampleData={handleLoadSampleData}
        onDownloadCSV={handleDownloadCSV}
        currentStepLabel={stepLabel}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1 w-full">
        {/* IN-APP NOTIFICATION & VERCEL TROUBLESHOOTING BANNER */}
        {notification && (
          <div
            className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-md transition-all ${
              notification.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                : notification.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100'
                : notification.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                : 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {notification.type === 'error' && (
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                {notification.type === 'warning' && (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                {notification.type === 'success' && (
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {notification.type === 'info' && (
                  <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-black tracking-tight">{notification.message}</h4>
                {notification.details && (
                  <p className="text-xs mt-1 font-medium opacity-90 leading-relaxed">
                    {notification.details}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-current transition-colors cursor-pointer shrink-0"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* MANAGER INQUIRY BAR */}
        <ManagerQuestionBar
          question={managerQuestion}
          onChangeQuestion={setManagerQuestion}
          selectedCount={selectedRecordIds.size}
          distinctCommentCount={distinctComments.length}
          disabled={isRunning}
        />

        {/* NAVIGATION TABS */}
        <div className="flex items-center justify-between border-b border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('workflow')}
              className={`pb-3.5 px-1 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'workflow'
                  ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-extrabold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Network className="w-4 h-4" />
              Agent Workflow &amp; Architecture
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`pb-3.5 px-1 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-extrabold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Executive Intelligence Dashboard
              {agents.agent4_final.status === 'Completed' && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-xs" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('records')}
              className={`pb-3.5 px-1 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'records'
                  ? 'border-teal-600 text-teal-700 dark:text-teal-400 font-extrabold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Database className="w-4 h-4" />
              Records Table ({selectedRecordIds.size}/{records.length})
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Fast AI Model:</span>
            <span className="font-mono text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2.5 py-0.5 rounded-md font-bold border border-teal-200 dark:border-teal-800">
              gemini-3.8-flash
            </span>
          </div>
        </div>

        {/* STEP-BY-STEP REVIEW INTERACTION CHECKPOINT */}
        {waitingForApproval && activeStep && (
          <StepReviewBar
            currentStep={activeStep}
            waitingForApproval={waitingForApproval}
            agents={agents}
            planResult={agents.agent4_plan.outputResult}
            onUpdatePlanItem={handleUpdatePlanItem}
            onApproveAndContinue={handleApproveAndContinue}
            onRerunAgent={handleRerunIndividualAgent}
            isRunning={isRunning}
          />
        )}

        {/* TAB 1: WORKFLOW & DIAGRAM */}
        {activeTab === 'workflow' && (
          <div className="space-y-6">
            <AgentDiagram
              agents={agents}
              activeStep={activeStep}
              runningAgentId={runningAgentId}
              onSelectAgent={(agentId) => setSelectedAgentModalId(agentId)}
              onRetryAgent={handleRerunIndividualAgent}
            />

            {/* Quick status summary grid */}
            <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors duration-200">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Live Workflow Execution Tracker
                </h3>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Mode: {runMode === 'auto' ? 'Autonomous Continuous Flow' : 'Human-in-the-Loop Review'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {Object.values(agents).map((ag) => {
                  const trackerColorMap: Record<string, { border: string; text: string; bg: string }> = {
                    agent4_plan: { border: 'border-indigo-300 dark:border-indigo-700 hover:border-indigo-500', text: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50/60 dark:bg-indigo-950/40' },
                    agent1: { border: 'border-emerald-300 dark:border-emerald-700 hover:border-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50/60 dark:bg-emerald-950/40' },
                    agent2: { border: 'border-amber-300 dark:border-amber-700 hover:border-amber-500', text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50/60 dark:bg-amber-950/40' },
                    agent3: { border: 'border-rose-300 dark:border-rose-700 hover:border-rose-500', text: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50/60 dark:bg-rose-950/40' },
                    agent6: { border: 'border-sky-300 dark:border-sky-700 hover:border-sky-500', text: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-50/60 dark:bg-sky-950/40' },
                    agent5: { border: 'border-purple-300 dark:border-purple-700 hover:border-purple-500', text: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50/60 dark:bg-purple-950/40' },
                    agent4_final: { border: 'border-teal-400 dark:border-teal-600 hover:border-teal-500', text: 'text-teal-800 dark:text-teal-300', bg: 'bg-teal-50/60 dark:bg-teal-950/40' },
                  };
                  const colors = trackerColorMap[ag.id] || trackerColorMap.agent4_plan;

                  return (
                    <button
                      key={ag.id}
                      type="button"
                      onClick={() => setSelectedAgentModalId(ag.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs group ${colors.bg} ${colors.border}`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className={`font-black uppercase tracking-wider ${colors.text}`}>
                          {ag.codeName}
                        </span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            ag.status === 'Completed'
                              ? 'bg-emerald-500'
                              : ag.status === 'Running'
                              ? 'bg-blue-500 animate-pulse'
                              : ag.status === 'Waiting for Review'
                              ? 'bg-amber-500'
                              : ag.status === 'Failed'
                              ? 'bg-rose-500'
                              : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        />
                      </div>
                      <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {ag.name}
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                        {ag.status}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DashboardView
            kpis={kpis}
            agent4Final={agents.agent4_final.outputResult}
            agent1Result={agents.agent1.outputResult}
            agent2Result={agents.agent2.outputResult}
            agent3Result={agents.agent3.outputResult}
            agent6Result={agents.agent6.outputResult}
            distinctComments={distinctComments}
            records={activeRecords}
            onOpenAgentModal={(agentId) => setSelectedAgentModalId(agentId)}
          />
        )}

        {/* TAB 3: RECORDS TABLE */}
        {activeTab === 'records' && (
          <DataTable
            records={records}
            selectedRecordIds={selectedRecordIds}
            onToggleSelectRecord={handleToggleRecord}
            onToggleSelectAll={handleToggleSelectAll}
            distinctComments={distinctComments}
            agent1Result={agents.agent1.outputResult}
            agent3Result={agents.agent3.outputResult}
          />
        )}
      </main>

      {/* AGENT DETAIL MODAL */}
      <AgentDetailModal
        agent={selectedAgentModalId ? agents[selectedAgentModalId] : null}
        onClose={() => setSelectedAgentModalId(null)}
        onRerunAgent={handleRerunIndividualAgent}
        isRunning={isRunning}
      />

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p>
            Hospital Patient Experience Intelligence System • Multi-Agent Autonomous Healthcare Demonstration
          </p>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <span>Server Proxy: <code>callLLM(prompt, data)</code></span>
            <span>•</span>
            <span>All KPIs calculated in JS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
