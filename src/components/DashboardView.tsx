import React from 'react';
import {
  Agent1Result,
  Agent2Result,
  Agent3Result,
  Agent4FinalResult,
  Agent6Result,
  CalculatedKPIs,
  DistinctComment,
  PatientRecord,
} from '../types/agents';
import {
  AlertTriangle,
  BarChart2,
  Brain,
  HeartPulse,
  MessageCircle,
  MessageSquareHeart,
  ShieldAlert,
  Sparkles,
  UserCheck,
} from 'lucide-react';

interface DashboardViewProps {
  kpis: CalculatedKPIs;
  agent4Final: Agent4FinalResult | null;
  agent1Result: Agent1Result | null;
  agent2Result: Agent2Result | null;
  agent3Result: Agent3Result | null;
  agent6Result: Agent6Result | null;
  distinctComments: DistinctComment[];
  records: PatientRecord[];
  onOpenAgentModal: (agentId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  agent4Final,
  agent1Result,
  agent2Result,
  agent3Result,
  agent6Result,
  distinctComments,
  records,
  onOpenAgentModal,
}) => {
  // Aggregate human review cases from Agent 3
  const humanReviewCases = React.useMemo(() => {
    if (!agent3Result || !agent3Result.comments) return [];
    return agent3Result.comments
      .filter((c) => c.human_review)
      .map((c) => {
        const commentObj = distinctComments.find((dc) => dc.id === c.id);
        return {
          id: c.id,
          category: c.category,
          severity: c.severity,
          route_to: c.route_to,
          review_reason: c.review_reason,
          commentText: commentObj?.comment || 'Comment details unavailable',
          recordCount: commentObj?.count || 1,
        };
      });
  }, [agent3Result, distinctComments]);

  // Aggregate Theme counts from Agent 1
  const themeCounts = React.useMemo(() => {
    if (!agent1Result || !agent1Result.comments) return {};
    const map: Record<string, number> = {};
    for (const c of agent1Result.comments) {
      const commentObj = distinctComments.find((dc) => dc.id === c.id);
      const weight = commentObj?.count || 1;
      map[c.theme] = (map[c.theme] || 0) + weight;
    }
    return map;
  }, [agent1Result, distinctComments]);

  // Aggregate Severity counts from Agent 3
  const severityCounts = React.useMemo(() => {
    if (!agent3Result || !agent3Result.comments) {
      return { 1: 0, 2: 0, 3: 0, 4: 0 };
    }
    const map: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const c of agent3Result.comments) {
      const commentObj = distinctComments.find((dc) => dc.id === c.id);
      const weight = commentObj?.count || 1;
      const s = c.severity || 1;
      map[s] = (map[s] || 0) + weight;
    }
    return map;
  }, [agent3Result, distinctComments]);

  const maxThemeCount = Math.max(...Object.values(themeCounts), 1);
  const totalSeverities = Object.values(severityCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* 1. TOP MANAGEMENT ALERT (AGENT 4) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-850 to-indigo-950 dark:from-teal-950 dark:via-slate-900 dark:to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-700/60 dark:border-teal-800/80">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-white/20 text-white backdrop-blur-md border border-white/25 shadow-xs">
                <Brain className="w-4 h-4 text-teal-300" />
                Produced by Agent 4: Orchestrator
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs ${
                  agent4Final?.priority === 'High'
                    ? 'bg-rose-500 text-white ring-2 ring-rose-400/50'
                    : 'bg-amber-500 text-white'
                }`}
              >
                Priority: {agent4Final?.priority || 'High'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onOpenAgentModal('agent4_final')}
              className="text-xs text-teal-200 hover:text-white font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
            >
              Inspect Agent 4 Logic &rarr;
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug">
            {agent4Final?.alert ||
              'Awaiting Agent 4 Orchestrator Final Decision & Executive Directives...'}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-teal-50/90 font-medium leading-relaxed max-w-4xl">
            {agent4Final?.answer ||
              'Run the multi-agent pipeline to generate prioritized hospital leadership actions, departmental routing, and root-cause analysis based on patient feedback.'}
          </p>

          {agent6Result?.improved_message && (
            <div className="mt-5 p-4 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <div className="text-xs font-black text-teal-200 flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                Agent 6 Ready-to-Send Patient Communication Fix (6th Grade Reading Level)
              </div>
              <p className="text-sm text-white italic font-serif leading-relaxed">
                &ldquo;{agent6Result.improved_message}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. KPI CARDS (Calculated by App via Pure JS) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
            Operational Key Performance Indicators (Calculated via JavaScript)
          </span>
          <span className="text-xs text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 font-bold px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
            Scope: {kpis.totalRecords} Records
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Satisfaction */}
          <div className="bg-white dark:bg-slate-850 rounded-2xl p-4.5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Avg Satisfaction</span>
              <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
                <HeartPulse className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                {kpis.avgSatisfaction || '0.0'}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 10</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between font-semibold">
              <span>Target: 8.0+</span>
              <span
                className={`font-black ${
                  kpis.avgSatisfaction >= 7 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {kpis.avgSatisfaction >= 7 ? 'Satisfactory' : 'Action Needed'}
              </span>
            </div>
          </div>

          {/* Communication Rating */}
          <div className="bg-white dark:bg-slate-850 rounded-2xl p-4.5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Communication</span>
              <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                <MessageCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                {kpis.avgCommunicationRating || '0.0'}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 10</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between font-semibold">
              <span>Goal: 8.5+</span>
              <span
                className={`font-black ${
                  kpis.avgCommunicationRating >= 7 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {kpis.avgCommunicationRating >= 7 ? 'Passing' : 'Deficit'}
              </span>
            </div>
          </div>

          {/* Follow-up Compliance */}
          <div className="bg-white dark:bg-slate-850 rounded-2xl p-4.5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Follow-Up Rate</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                {kpis.followupComplianceRate}%
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between font-semibold">
              <span>Compliance = 1</span>
              <span className="font-bold text-teal-700 dark:text-teal-300">
                Portal: {kpis.portalUsageRate}%
              </span>
            </div>
          </div>

          {/* Human Review Escalations */}
          <div className="bg-white dark:bg-slate-850 rounded-2xl p-4.5 border border-rose-300 dark:border-rose-800/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider">Human Reviews</span>
              <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400">
                {humanReviewCases.length}
              </span>
              <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">
                ({humanReviewCases.reduce((acc, c) => acc + c.recordCount, 0)} records)
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between font-semibold">
              <span>Agent 3 Triage</span>
              <span className="font-black text-rose-600 dark:text-rose-400">Severity &ge; 3</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CHART 1: Satisfaction by Service Line */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Satisfaction by Service Line
              </h3>
              <span className="text-[10px] font-black text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                JS Computed
              </span>
            </div>

            <div className="space-y-3.5 mt-3">
              {Object.entries(kpis.satisfactionByServiceLine).length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No records available</p>
              ) : (
                Object.entries(kpis.satisfactionByServiceLine).map(([service, val]) => (
                  <div key={service} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">{service}</span>
                      <span className="font-black text-slate-900 dark:text-white font-mono">{val} / 10</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          val >= 7
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                            : val >= 4
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                            : 'bg-gradient-to-r from-rose-500 to-red-600'
                        }`}
                        style={{ width: `${Math.min(100, (val / 10) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
            Aggregated real-time across all active hospital records.
          </p>
        </div>

        {/* CHART 2: Main Comment Themes (Agent 1 Feedback) */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <MessageSquareHeart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Feedback Themes Breakdown
              </h3>
              <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Agent 1 Feedback
              </span>
            </div>

            <div className="space-y-3.5 mt-3">
              {Object.entries(themeCounts).length === 0 ? (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
                  Run Agent 1 to classify patient feedback themes.
                </div>
              ) : (
                Object.entries(themeCounts).map(([theme, count]) => {
                  const pct = Math.round((count / kpis.totalRecords) * 100);
                  return (
                    <div key={theme} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-800 dark:text-slate-200 truncate max-w-[170px]">{theme}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                          style={{ width: `${(count / maxThemeCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-medium">
            <span>Derived from distinct comments</span>
            <button
              type="button"
              onClick={() => onOpenAgentModal('agent1')}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-bold cursor-pointer"
            >
              View Agent 1 &rarr;
            </button>
          </div>
        </div>

        {/* CHART 3: Severity Levels (Agent 3 Triage) */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Triage Severity Distribution
              </h3>
              <span className="text-[10px] font-black text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                Agent 3 Triage
              </span>
            </div>

            <div className="space-y-3 mt-3">
              {/* Level 4 Critical */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-700 inline-block shadow-xs" />
                    Level 4 Critical
                  </span>
                  <span className="font-black text-red-600 dark:text-red-400 font-mono">
                    {severityCounts[4]} cases
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-red-700 rounded-full transition-all duration-500"
                    style={{ width: `${(severityCounts[4] / totalSeverities) * 100}%` }}
                  />
                </div>
              </div>

              {/* Level 3 High */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-xs" />
                    Level 3 High
                  </span>
                  <span className="font-black text-rose-600 dark:text-rose-400 font-mono">
                    {severityCounts[3]} cases
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${(severityCounts[3] / totalSeverities) * 100}%` }}
                  />
                </div>
              </div>

              {/* Level 2 Moderate */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs" />
                    Level 2 Moderate
                  </span>
                  <span className="font-black text-amber-600 dark:text-amber-400 font-mono">
                    {severityCounts[2]} cases
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${(severityCounts[2] / totalSeverities) * 100}%` }}
                  />
                </div>
              </div>

              {/* Level 1 Low */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-xs" />
                    Level 1 Low
                  </span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {severityCounts[1]} cases
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(severityCounts[1] / totalSeverities) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-medium">
            <span>Levels 3 &amp; 4 trigger human review</span>
            <button
              type="button"
              onClick={() => onOpenAgentModal('agent3')}
              className="text-rose-700 dark:text-rose-400 hover:underline font-bold cursor-pointer"
            >
              View Agent 3 &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 4. TABLE OF CASES NEEDING HUMAN REVIEW */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-rose-300 dark:border-rose-900/80 shadow-xs overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-rose-50/80 to-white dark:from-rose-950/40 dark:to-slate-850 border-b border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                Produced by Agent 3: Complaint Triage
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                Mandatory Clinical Escalation
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
              Active Cases Requiring Immediate Human Review ({humanReviewCases.length} Issues)
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Linked to patient records across departments
          </span>
        </div>

        {humanReviewCases.length === 0 ? (
          <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
            No high-severity human review triggers detected yet. Run the multi-agent workflow to evaluate.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Comment ID</th>
                  <th className="py-3 px-4">Distinct Patient Comment</th>
                  <th className="py-3 px-4">Records</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Assigned Department</th>
                  <th className="py-3 px-4">Review Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-sans">
                {humanReviewCases.map((item) => (
                  <tr key={item.id} className="hover:bg-rose-50/40 dark:hover:bg-rose-950/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-teal-800 dark:text-teal-400 whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                      &ldquo;{item.commentText}&rdquo;
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px]">
                        {item.recordCount} records
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                          item.severity >= 4
                            ? 'bg-red-700 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        Severity {item.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-teal-800 dark:text-teal-300">
                      {item.route_to}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-rose-900 dark:text-rose-200 font-semibold text-[11px] leading-relaxed">
                      {item.review_reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. BOTTOM: AGENT 4'S THREE MANAGEMENT RECOMMENDATIONS */}
      <div className="bg-white dark:bg-slate-850 rounded-3xl border border-indigo-200/90 dark:border-indigo-900/80 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-1.5">
              <Brain className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Produced by Agent 4: Orchestrator Final Decision
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Three Priority Management Recommendations
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            Assigned Owner &amp; Timeframe Matrix
          </span>
        </div>

        {agent4Final?.recommendations && agent4Final.recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
            {agent4Final.recommendations.map((rec, i) => (
              <div
                key={i}
                className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4.5 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-2xs hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center text-xs font-black shadow-xs">
                      {i + 1}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                      {rec.timeframe || 'Immediate'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {rec.action}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Owner:</span>
                  <span className="font-extrabold text-teal-800 dark:text-teal-300">{rec.owner}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
            Run the workflow to synthesize Agent 4&apos;s executive recommendations.
          </div>
        )}
      </div>
    </div>
  );
};
