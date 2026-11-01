import React from 'react';
import { Agent4PlanResult, AgentState, WorkflowStep } from '../types/agents';
import { Edit3, RotateCw, ShieldCheck, Sliders } from 'lucide-react';

interface StepReviewBarProps {
  currentStep: WorkflowStep;
  waitingForApproval: boolean;
  agents: Record<string, AgentState>;
  planResult: Agent4PlanResult | null;
  onUpdatePlanItem: (agentKey: 'Feedback' | 'Monitoring' | 'Triage' | 'Communication', run: boolean, task: string) => void;
  onApproveAndContinue: () => void;
  onRerunAgent: (agentId: string) => void;
  isRunning: boolean;
}

export const StepReviewBar: React.FC<StepReviewBarProps> = ({
  currentStep,
  waitingForApproval,
  agents,
  planResult,
  onUpdatePlanItem,
  onApproveAndContinue,
  onRerunAgent,
  isRunning,
}) => {
  if (!waitingForApproval) return null;

  const specialistKeyMap: Record<string, { id: string; key: 'Feedback' | 'Monitoring' | 'Triage' | 'Communication'; name: string }> = {
    agent1: { id: 'agent1', key: 'Feedback', name: 'Agent 1: Patient Feedback' },
    agent2: { id: 'agent2', key: 'Monitoring', name: 'Agent 2: Experience Monitoring' },
    agent3: { id: 'agent3', key: 'Triage', name: 'Agent 3: Complaint Triage' },
    agent6: { id: 'agent6', key: 'Communication', name: 'Agent 6: Communication Quality' },
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-teal-500/15 to-indigo-500/15 dark:from-amber-950/40 dark:via-teal-950/40 dark:to-indigo-950/40 border-2 border-amber-400 dark:border-amber-600/80 rounded-2xl p-5 shadow-xl backdrop-blur-md my-6 transition-all duration-300">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-amber-300/60 dark:border-amber-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl shadow-md">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 bg-amber-200/90 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                Human-in-the-Loop Checkpoint
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                Step {currentStep} of 4 Complete
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {currentStep === 1 && 'Review & Customize Orchestrator Plan'}
              {currentStep === 2 && 'Review Specialist Agent Findings (Step 2)'}
              {currentStep === 3 && 'Review Executive Analytics Synthesis (Step 3)'}
            </h3>
          </div>
        </div>

        <button
          type="button"
          disabled={isRunning}
          onClick={onApproveAndContinue}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold rounded-xl shadow-lg shadow-teal-700/25 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
        >
          {isRunning ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5 text-teal-200" />
              Approve &amp; Continue &rarr;
            </>
          )}
        </button>
      </div>

      {/* STEP 1: Plan Review and Edit */}
      {currentStep === 1 && planResult && (
        <div className="mt-4 space-y-4">
          <div className="bg-white/90 dark:bg-slate-800/90 p-4 rounded-xl border border-amber-300 dark:border-amber-800 shadow-xs">
            <div className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-1">
              Agent 4 Orchestrator Goal Formulation
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 italic leading-relaxed">
              &ldquo;{planResult.goal}&rdquo;
            </p>
          </div>

          <div>
            <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Specialist Directives (Toggle on/off or click text to customize task):</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Click input to modify task</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(specialistKeyMap).map(([agentId, meta]) => {
                const planItem = planResult.agents.find((a) => a.agent === meta.key);
                const isEnabled = planItem ? planItem.run : true;
                const currentTask = planItem?.task || agents[agentId]?.customTask || '';

                return (
                  <div
                    key={agentId}
                    className={`p-4 rounded-xl border transition-all ${
                      isEnabled
                        ? 'bg-white dark:bg-slate-800/95 border-slate-300 dark:border-slate-700 shadow-xs'
                        : 'bg-slate-100/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) =>
                              onUpdatePlanItem(meta.key, e.target.checked, currentTask)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5.5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {meta.name}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          isEnabled
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isEnabled ? 'Enabled' : 'Skipped'}
                      </span>
                    </div>

                    <div className="relative mt-2.5">
                      <input
                        type="text"
                        disabled={!isEnabled}
                        value={currentTask}
                        onChange={(e) =>
                          onUpdatePlanItem(meta.key, isEnabled, e.target.value)
                        }
                        placeholder="Define agent task..."
                        className="w-full text-xs font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-hidden pr-8 transition-colors"
                      />
                      <Edit3 className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Specialist Results Review */}
      {currentStep === 2 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Inspect the findings from the four specialists below. You can re-run any individual agent if its findings need refinement before continuing to Executive Analytics.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {Object.entries(specialistKeyMap).map(([agentId, meta]) => {
              const agent = agents[agentId];
              const isSkipped = agent.status === 'Skipped';
              const isRunningThis = agent.status === 'Running';

              return (
                <div
                  key={agentId}
                  className="bg-white dark:bg-slate-800/90 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {agent.codeName}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          agent.status === 'Completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : agent.status === 'Skipped'
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {agent.outputResult?.summary ||
                        agent.outputResult?.recommendation ||
                        agent.outputResult?.biggest_problem ||
                        (isSkipped ? 'Skipped in approved plan.' : 'Pending output.')}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      {agent.outputResult ? 'Ready' : isSkipped ? 'Skipped' : 'None'}
                    </span>
                    <button
                      type="button"
                      disabled={isRunningThis}
                      onClick={() => onRerunAgent(agentId)}
                      className="text-xs text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-200 font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
                    >
                      <RotateCw className={`w-3 h-3 ${isRunningThis ? 'animate-spin' : ''}`} />
                      Re-run agent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Analytics Review */}
      {currentStep === 3 && (
        <div className="mt-4">
          <div className="bg-white dark:bg-slate-800/90 rounded-xl p-4.5 border border-purple-200 dark:border-purple-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                Agent 5 Analytics Executive Brief
              </span>
              <button
                type="button"
                onClick={() => onRerunAgent('agent5')}
                className="text-xs text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-200 font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Re-run Agent 5
              </button>
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
              {agents.agent5.outputResult?.headline || 'Analyzing findings...'}
            </h4>
            {agents.agent5.outputResult?.key_findings && (
              <ul className="mt-2.5 space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 list-disc list-inside">
                {agents.agent5.outputResult.key_findings.slice(0, 3).map((f: string, i: number) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
