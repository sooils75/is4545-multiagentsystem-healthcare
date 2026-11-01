import React, { useState } from 'react';
import { AgentState } from '../types/agents';
import {
  X,
  Copy,
  Check,
  RotateCw,
  FileText,
  Database,
  Code2,
  AlertTriangle,
  Sparkles,
  Brain,
} from 'lucide-react';

interface AgentDetailModalProps {
  agent: AgentState | null;
  onClose: () => void;
  onRerunAgent?: (agentId: string) => void;
  isRunning?: boolean;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agent,
  onClose,
  onRerunAgent,
  isRunning = false,
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'input' | 'json'>('card');
  const [copied, setCopied] = useState(false);

  if (!agent) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderFormattedResult = () => {
    if (!agent.outputResult) {
      return (
        <div className="py-12 text-center text-slate-400 dark:text-slate-500">
          <Database className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No results generated yet.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {agent.status === 'Skipped'
              ? 'This specialist was skipped in the approved plan.'
              : 'Run the workflow to trigger this agent.'}
          </p>
        </div>
      );
    }

    switch (agent.id) {
      case 'agent4_plan': {
        const plan = agent.outputResult;
        return (
          <div className="space-y-4">
            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                Orchestrator Goal
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5 italic leading-relaxed">
                &ldquo;{plan.goal}&rdquo;
              </p>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2.5">
                Assigned Specialist Tasks
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                {(plan.agents || []).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs ${
                      item.run
                        ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {item.agent} Specialist
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          item.run
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {item.run ? 'Enabled' : 'Skipped'}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong className="text-slate-900 dark:text-white font-bold">Directive:</strong> {item.task || 'Default analysis'}
                    </p>
                    {item.reason && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Reason: {item.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'agent1': {
        const data = agent.outputResult;
        return (
          <div className="space-y-4">
            {data.summary && (
              <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Feedback Synthesis
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 leading-relaxed">
                  {data.summary}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2.5">
                Distinct Comment Analysis ({data.comments?.length || 0})
              </h4>
              <div className="space-y-2.5">
                {(data.comments || []).map((c: any, i: number) => (
                  <div
                    key={i}
                    className="p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                        {c.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            c.sentiment === 'Positive'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : c.sentiment === 'Negative'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                          }`}
                        >
                          {c.sentiment}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {c.theme}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">{c.reason}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-700">
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">Operational Issue:</span>{' '}
                        {c.operational_issue || 'None'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">Risk Concern:</span>{' '}
                        <span
                          className={
                            c.risk_concern && c.risk_concern.toLowerCase() !== 'none'
                              ? 'text-rose-600 dark:text-rose-400 font-black'
                              : ''
                          }
                        >
                          {c.risk_concern || 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'agent2': {
        const mon = agent.outputResult;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">Safety Risk</span>
                <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{mon.risk?.patient_safety || 'Low'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">Reputation</span>
                <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{mon.risk?.reputation || 'Moderate'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase">Equity Risk</span>
                <p className="text-base font-black text-rose-600 dark:text-rose-400 mt-0.5">{mon.risk?.equity || 'High'}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Discovered Group Patterns
              </h4>
              <div className="space-y-2">
                {(mon.patterns || []).map((p: any, i: number) => (
                  <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl text-xs shadow-2xs">
                    <p className="font-bold text-slate-900 dark:text-white">{p.pattern}</p>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{p.evidence}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Equity &amp; Access Concerns
              </h4>
              <div className="space-y-2">
                {(mon.equity_concerns || []).map((e: any, i: number) => (
                  <div key={i} className="bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3.5 rounded-xl text-xs shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-amber-900 dark:text-amber-300">{e.group}</span>
                    </div>
                    <p className="text-slate-900 dark:text-slate-100 font-bold">{e.concern}</p>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 leading-relaxed">{e.evidence}</p>
                  </div>
                ))}
              </div>
            </div>

            {mon.recommendation && (
              <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-xs">
                <span className="font-black text-teal-800 dark:text-teal-300 uppercase text-[10px] block mb-1">
                  Monitoring Recommendation
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{mon.recommendation}</p>
              </div>
            )}
          </div>
        );
      }

      case 'agent3': {
        const triage = agent.outputResult;
        return (
          <div className="space-y-4">
            {triage.summary && (
              <div className="bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-3.5 text-xs text-slate-800 dark:text-slate-200">
                <span className="font-black text-rose-800 dark:text-rose-300 uppercase text-[10px] block mb-1">
                  Triage Distribution Summary
                </span>
                {triage.summary}
              </div>
            )}

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Triaged Complaints ({triage.comments?.length || 0})
              </h4>
              <div className="space-y-2.5">
                {(triage.comments || []).map((c: any, i: number) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 shadow-2xs ${
                      c.human_review
                        ? 'bg-rose-50/40 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                        {c.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            c.severity >= 3
                              ? 'bg-rose-600 text-white'
                              : c.severity === 2
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          Severity {c.severity}
                        </span>
                        {c.human_review && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Human Review Required
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      <span><strong>Category:</strong> {c.category}</span>
                      <span>•</span>
                      <span><strong>Route To:</strong> <span className="text-teal-700 dark:text-teal-400 font-bold">{c.route_to}</span></span>
                    </div>

                    <p className="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">{c.severity_reason}</p>

                    {c.human_review && c.review_reason && (
                      <p className="text-[11px] text-rose-900 dark:text-rose-200 bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-lg border border-rose-200 dark:border-rose-800 leading-relaxed">
                        <strong className="text-rose-700 dark:text-rose-400">Escalation Justification:</strong> {c.review_reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'agent6': {
        const comm = agent.outputResult;
        return (
          <div className="space-y-4">
            {comm.biggest_problem && (
              <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl p-4">
                <span className="text-xs font-black uppercase tracking-wider text-sky-800 dark:text-sky-300">
                  Primary Communication Breakdown
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 leading-relaxed">
                  {comm.biggest_problem}
                </p>
              </div>
            )}

            {comm.improved_message && (
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/60 dark:to-emerald-950/60 border border-teal-200 dark:border-teal-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-black text-teal-800 dark:text-teal-300 uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-pulse" />
                  Recommended Patient Message (6th Grade Reading Level)
                </div>
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-teal-100 dark:border-teal-800 text-xs font-medium text-slate-900 dark:text-slate-100 leading-relaxed shadow-inner">
                  &ldquo;{comm.improved_message}&rdquo;
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Identified Problems &amp; Proposed Fixes
              </h4>
              <div className="space-y-2">
                {(comm.problems || []).map((p: any, i: number) => (
                  <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl text-xs space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                        {p.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.risk === 'High'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                            : p.risk === 'Moderate'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {p.risk} Risk
                      </span>
                    </div>
                    <p className="text-slate-900 dark:text-slate-100 font-bold">{p.what_went_wrong}</p>
                    <p className="text-[11px] text-teal-800 dark:text-teal-300 bg-teal-50/70 dark:bg-teal-950/60 p-2 rounded-lg font-medium">
                      <strong>Fix:</strong> {p.improvement}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'agent5': {
        const an = agent.outputResult;
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
              <span className="text-xs font-black uppercase tracking-wider text-purple-800 dark:text-purple-300">
                Executive Headline
              </span>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-1 leading-snug">
                {an.headline}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Key Findings (With Evidence)
              </h4>
              <div className="space-y-2">
                {(an.key_findings || []).map((kf: string, i: number) => (
                  <div key={i} className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-slate-800 dark:text-slate-200 font-semibold shadow-2xs leading-relaxed">
                    {kf}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Top 3 Priorities
                </h4>
                <div className="space-y-1.5">
                  {(an.priorities || []).map((p: string, i: number) => (
                    <div key={i} className="text-xs bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium">
                      <strong>#{i + 1}</strong> {p}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Quick Wins (&lt; 3 Months)
                </h4>
                <div className="space-y-1.5">
                  {(an.quick_wins || []).map((qw: string, i: number) => (
                    <div key={i} className="text-xs bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold">
                      ✓ {qw}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {an.ai_ideas?.length > 0 && (
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Long-Term AI Solutions (6 - 12 Months)
                </h4>
                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {an.ai_ideas.map((idea: string, i: number) => (
                    <div key={i} className="bg-indigo-50/60 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800">
                      • {idea}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'agent4_final': {
        const final = agent.outputResult;
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-indigo-900 text-white rounded-xl p-4.5 shadow-md">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                Executive Alert
              </span>
              <h3 className="text-base sm:text-lg font-black mt-2 leading-snug">{final.alert}</h3>
              <p className="text-xs text-teal-100 mt-2 leading-relaxed">{final.answer}</p>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Executive Action Recommendations
              </h4>
              <div className="space-y-2">
                {(final.recommendations || []).map((rec: any, i: number) => (
                  <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl text-xs shadow-2xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-slate-900 dark:text-white">Action #{i + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2.5 py-0.5 rounded-full">
                          {rec.owner}
                        </span>
                        <span className="text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                          {rec.timeframe}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">{rec.action}</p>
                  </div>
                ))}
              </div>
            </div>

            {final.human_review?.length > 0 && (
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Mandatory Human Review Escalations
                </h4>
                <div className="space-y-2">
                  {final.human_review.map((hr: any, i: number) => (
                    <div key={i} className="bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3 rounded-xl text-xs">
                      <p className="font-black text-rose-900 dark:text-rose-200">{hr.item}</p>
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] mt-1 leading-relaxed">{hr.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden transition-colors duration-200">
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl text-white ${agent.accentColor} shadow-md`}>
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-slate-500 dark:text-slate-400 uppercase">
                  {agent.codeName}
                </span>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    agent.status === 'Completed'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : agent.status === 'Running'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                      : agent.status === 'Waiting for Review'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      : agent.status === 'Failed'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {agent.status}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                {agent.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRerunAgent && (
              <button
                type="button"
                disabled={isRunning}
                onClick={() => onRerunAgent(agent.id)}
                className="text-xs text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold transition-all cursor-pointer shadow-2xs"
                title="Re-run only this AI call"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                Re-run
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="px-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-5 bg-white dark:bg-slate-900 text-xs font-bold text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setActiveTab('card')}
            className={`py-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'card'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Structured Card
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('input')}
            className={`py-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'input'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            Input Data Received
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`py-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'json'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Raw JSON Output
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-900/60">
          {activeTab === 'card' && renderFormattedResult()}

          {activeTab === 'input' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <span>Data payload provided to this specialist:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(JSON.stringify(agent.inputData, null, 2))}
                  className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Data'}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-96 border border-slate-800 shadow-inner">
                {agent.inputData
                  ? JSON.stringify(agent.inputData, null, 2)
                  : '// No input data recorded yet.'}
              </pre>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <span>Model generated JSON response:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(JSON.stringify(agent.outputResult, null, 2))}
                  className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-96 border border-slate-800 shadow-inner">
                {agent.outputResult
                  ? JSON.stringify(agent.outputResult, null, 2)
                  : '// No JSON result yet.'}
              </pre>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium">Role: {agent.roleDescription}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
