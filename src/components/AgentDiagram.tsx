import React from 'react';
import { AgentState } from '../types/agents';
import {
  Brain,
  MessageSquareHeart,
  Activity,
  ShieldAlert,
  Megaphone,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCw,
  Eye,
  Slash,
  ArrowDown,
  ArrowRight,
  Zap,
  GitBranch,
  GitMerge,
  Sparkles,
} from 'lucide-react';

interface AgentDiagramProps {
  agents: Record<string, AgentState>;
  activeStep: number | null;
  runningAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  onRetryAgent?: (agentId: string) => void;
}

interface AgentThemeConfig {
  borderDefault: string;
  borderHover: string;
  borderActive: string;
  cardBg: string;
  topStripe: string;
  iconBg: string;
  codePill: string;
  stepBadgeBg: string;
  portBg: string;
  subtleBoxBg: string;
  subtleBoxBorder: string;
  accentText: string;
  glowShadow: string;
  conduitActive: string;
  badgeBg: string;
  badgeText: string;
}

const AGENT_THEMES: Record<string, AgentThemeConfig> = {
  agent4_plan: {
    borderDefault: 'border-indigo-300 dark:border-indigo-600/80',
    borderHover: 'hover:border-indigo-500 dark:hover:border-indigo-400',
    borderActive: 'border-indigo-500 ring-4 ring-indigo-500/30',
    cardBg: 'bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/40 dark:from-indigo-950/50 dark:via-slate-850 dark:to-violet-950/30',
    topStripe: 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600',
    iconBg: 'bg-gradient-to-tr from-indigo-700 to-indigo-500 shadow-indigo-600/30',
    codePill: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800',
    stepBadgeBg: 'bg-indigo-600',
    portBg: 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,1)]',
    subtleBoxBg: 'bg-indigo-50/70 dark:bg-indigo-950/60',
    subtleBoxBorder: 'border-indigo-200 dark:border-indigo-800',
    accentText: 'text-indigo-700 dark:text-indigo-400',
    glowShadow: 'shadow-lg shadow-indigo-500/15',
    conduitActive: 'bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_14px_rgba(99,102,241,0.95)]',
    badgeBg: 'bg-indigo-600',
    badgeText: 'text-white',
  },
  agent1: {
    borderDefault: 'border-emerald-300 dark:border-emerald-600/80',
    borderHover: 'hover:border-emerald-500 dark:hover:border-emerald-400',
    borderActive: 'border-emerald-500 ring-4 ring-emerald-500/30',
    cardBg: 'bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 dark:from-emerald-950/50 dark:via-slate-850 dark:to-teal-950/30',
    topStripe: 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600',
    iconBg: 'bg-gradient-to-tr from-emerald-700 to-emerald-500 shadow-emerald-600/30',
    codePill: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
    stepBadgeBg: 'bg-emerald-600',
    portBg: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,1)]',
    subtleBoxBg: 'bg-emerald-50/70 dark:bg-emerald-950/60',
    subtleBoxBorder: 'border-emerald-200 dark:border-emerald-800',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    glowShadow: 'shadow-lg shadow-emerald-500/15',
    conduitActive: 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.95)]',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
  },
  agent2: {
    borderDefault: 'border-amber-300 dark:border-amber-600/80',
    borderHover: 'hover:border-amber-500 dark:hover:border-amber-400',
    borderActive: 'border-amber-500 ring-4 ring-amber-500/30',
    cardBg: 'bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 dark:from-amber-950/50 dark:via-slate-850 dark:to-orange-950/30',
    topStripe: 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600',
    iconBg: 'bg-gradient-to-tr from-amber-600 to-orange-500 shadow-amber-600/30',
    codePill: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-200 dark:border-amber-800',
    stepBadgeBg: 'bg-amber-600',
    portBg: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,1)]',
    subtleBoxBg: 'bg-amber-50/70 dark:bg-amber-950/60',
    subtleBoxBorder: 'border-amber-200 dark:border-amber-800',
    accentText: 'text-amber-700 dark:text-amber-400',
    glowShadow: 'shadow-lg shadow-amber-500/15',
    conduitActive: 'bg-amber-500 dark:bg-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.95)]',
    badgeBg: 'bg-amber-600',
    badgeText: 'text-white',
  },
  agent3: {
    borderDefault: 'border-rose-300 dark:border-rose-600/80',
    borderHover: 'hover:border-rose-500 dark:hover:border-rose-400',
    borderActive: 'border-rose-500 ring-4 ring-rose-500/30',
    cardBg: 'bg-gradient-to-br from-rose-50/80 via-white to-red-50/40 dark:from-rose-950/50 dark:via-slate-850 dark:to-red-950/30',
    topStripe: 'bg-gradient-to-r from-rose-500 via-rose-600 to-red-600',
    iconBg: 'bg-gradient-to-tr from-rose-600 to-red-600 shadow-rose-600/30',
    codePill: 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border-rose-200 dark:border-rose-800',
    stepBadgeBg: 'bg-rose-600',
    portBg: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,1)]',
    subtleBoxBg: 'bg-rose-50/70 dark:bg-rose-950/60',
    subtleBoxBorder: 'border-rose-200 dark:border-rose-800',
    accentText: 'text-rose-700 dark:text-rose-400',
    glowShadow: 'shadow-lg shadow-rose-500/15',
    conduitActive: 'bg-rose-500 dark:bg-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.95)]',
    badgeBg: 'bg-rose-600',
    badgeText: 'text-white',
  },
  agent6: {
    borderDefault: 'border-sky-300 dark:border-sky-600/80',
    borderHover: 'hover:border-sky-500 dark:hover:border-sky-400',
    borderActive: 'border-sky-500 ring-4 ring-sky-500/30',
    cardBg: 'bg-gradient-to-br from-sky-50/80 via-white to-cyan-50/40 dark:from-sky-950/50 dark:via-slate-850 dark:to-cyan-950/30',
    topStripe: 'bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-600',
    iconBg: 'bg-gradient-to-tr from-sky-600 to-cyan-500 shadow-sky-600/30',
    codePill: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200 border-sky-200 dark:border-sky-800',
    stepBadgeBg: 'bg-sky-600',
    portBg: 'bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,1)]',
    subtleBoxBg: 'bg-sky-50/70 dark:bg-sky-950/60',
    subtleBoxBorder: 'border-sky-200 dark:border-sky-800',
    accentText: 'text-sky-700 dark:text-sky-400',
    glowShadow: 'shadow-lg shadow-sky-500/15',
    conduitActive: 'bg-sky-500 dark:bg-sky-400 shadow-[0_0_14px_rgba(14,165,233,0.95)]',
    badgeBg: 'bg-sky-600',
    badgeText: 'text-white',
  },
  agent5: {
    borderDefault: 'border-purple-300 dark:border-purple-600/80',
    borderHover: 'hover:border-purple-500 dark:hover:border-purple-400',
    borderActive: 'border-purple-500 ring-4 ring-purple-500/30',
    cardBg: 'bg-gradient-to-br from-purple-50/80 via-white to-fuchsia-50/40 dark:from-purple-950/50 dark:via-slate-850 dark:to-fuchsia-950/30',
    topStripe: 'bg-gradient-to-r from-purple-500 via-purple-600 to-fuchsia-600',
    iconBg: 'bg-gradient-to-tr from-purple-700 to-purple-500 shadow-purple-600/30',
    codePill: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 border-purple-200 dark:border-purple-800',
    stepBadgeBg: 'bg-purple-600',
    portBg: 'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,1)]',
    subtleBoxBg: 'bg-purple-50/70 dark:bg-purple-950/60',
    subtleBoxBorder: 'border-purple-200 dark:border-purple-800',
    accentText: 'text-purple-700 dark:text-purple-400',
    glowShadow: 'shadow-lg shadow-purple-500/15',
    conduitActive: 'bg-purple-500 dark:bg-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.95)]',
    badgeBg: 'bg-purple-600',
    badgeText: 'text-white',
  },
  agent4_final: {
    borderDefault: 'border-teal-400 dark:border-teal-500',
    borderHover: 'hover:border-teal-600 dark:hover:border-teal-300',
    borderActive: 'border-teal-600 ring-4 ring-teal-500/30',
    cardBg: 'bg-gradient-to-br from-teal-50/90 via-white to-cyan-50/40 dark:from-teal-950/60 dark:via-slate-850 dark:to-cyan-950/40',
    topStripe: 'bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700',
    iconBg: 'bg-gradient-to-tr from-teal-800 to-teal-600 shadow-teal-700/30',
    codePill: 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200 border-teal-200 dark:border-teal-800',
    stepBadgeBg: 'bg-teal-700',
    portBg: 'bg-teal-600 shadow-[0_0_12px_rgba(13,148,136,1)]',
    subtleBoxBg: 'bg-teal-50/70 dark:bg-teal-950/60',
    subtleBoxBorder: 'border-teal-200 dark:border-teal-800',
    accentText: 'text-teal-800 dark:text-teal-300',
    glowShadow: 'shadow-lg shadow-teal-600/20',
    conduitActive: 'bg-teal-600 dark:bg-teal-400 shadow-[0_0_14px_rgba(13,148,136,0.95)]',
    badgeBg: 'bg-teal-700',
    badgeText: 'text-white',
  },
};

export const AgentDiagram: React.FC<AgentDiagramProps> = ({
  agents,
  activeStep,
  runningAgentId,
  onSelectAgent,
  onRetryAgent,
}) => {
  const getIcon = (agentId: string) => {
    switch (agentId) {
      case 'agent4_plan':
      case 'agent4_final':
        return <Brain className="w-5 h-5" />;
      case 'agent1':
        return <MessageSquareHeart className="w-5 h-5" />;
      case 'agent2':
        return <Activity className="w-5 h-5" />;
      case 'agent3':
        return <ShieldAlert className="w-5 h-5" />;
      case 'agent6':
        return <Megaphone className="w-5 h-5" />;
      case 'agent5':
        return <BarChart3 className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: AgentState['status'], agentId: string) => {
    switch (status) {
      case 'Running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 shadow-xs animate-pulse">
            <RotateCw className="w-3 h-3 animate-spin text-blue-600 dark:text-blue-400" />
            Running
          </span>
        );
      case 'Waiting for Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-xs">
            <Eye className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Review Needed
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Completed
          </span>
        );
      case 'Skipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
            <Slash className="w-3 h-3" />
            Skipped
          </span>
        );
      case 'Failed':
        return (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 shadow-xs">
              <AlertCircle className="w-3 h-3 text-rose-600" />
              Failed
            </span>
            {onRetryAgent && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetryAgent(agentId);
                }}
                className="text-xs px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                Retry
              </button>
            )}
          </div>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3 h-3 text-slate-400" />
            Pending
          </span>
        );
    }
  };

  const isStep1Completed = agents.agent4_plan.status === 'Completed';
  const isStep2Active =
    activeStep === 2 ||
    ['agent1', 'agent2', 'agent3', 'agent6'].includes(runningAgentId || '');
  const isStep2Completed =
    ['agent1', 'agent2', 'agent3', 'agent6'].every(
      (id) => agents[id]?.status === 'Completed' || agents[id]?.status === 'Skipped'
    );
  const isStep3Active = activeStep === 3 || runningAgentId === 'agent5';
  const isStep3Completed = agents.agent5.status === 'Completed';
  const isStep4Active = activeStep === 4 || runningAgentId === 'agent4_final';
  const isStep4Completed = agents.agent4_final.status === 'Completed';

  // State checks for pipeline conduits
  const connector1Active = isStep2Active || isStep1Completed;
  const connector2Active = isStep3Active || isStep2Completed;
  const connector3Active = isStep4Active || isStep3Completed;

  // Render high-contrast connection terminal port
  const renderPort = (position: 'top' | 'bottom' | 'left' | 'right', isActive: boolean, portClass: string) => {
    const posClass =
      position === 'top'
        ? '-top-3 left-1/2 -translate-x-1/2'
        : position === 'bottom'
        ? '-bottom-3 left-1/2 -translate-x-1/2'
        : position === 'left'
        ? 'top-1/2 -left-3 -translate-y-1/2'
        : 'top-1/2 -right-3 -translate-y-1/2';

    return (
      <div
        className={`absolute ${posClass} w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 transition-all duration-300 z-30 flex items-center justify-center ${
          isActive
            ? `${portClass} scale-110 ring-4 ring-white/60 dark:ring-slate-900/60 shadow-lg`
            : 'bg-slate-400 dark:bg-slate-600 ring-2 ring-white/40 dark:ring-slate-800'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-white dark:bg-slate-900" />
      </div>
    );
  };

  const renderAgentBox = (
    agentId: string,
    stepNum: number,
    inputLabel: string,
    outputLabel: string,
    isFinal = false
  ) => {
    const agent = agents[agentId];
    if (!agent) return null;

    const theme = AGENT_THEMES[agentId] || AGENT_THEMES.agent4_plan;
    const isRunning = runningAgentId === agentId;
    const isWaiting = agent.status === 'Waiting for Review';
    const isCompleted = agent.status === 'Completed';
    const isSkipped = agent.status === 'Skipped';
    const isFailed = agent.status === 'Failed';

    return (
      <div
        onClick={() => onSelectAgent(agentId)}
        className={`relative group cursor-pointer transition-all duration-300 rounded-2xl border-2 shadow-sm hover:shadow-xl ${theme.cardBg} ${
          isRunning
            ? `${theme.borderActive} animate-glow scale-[1.02]`
            : isWaiting
            ? 'ring-2 ring-amber-400/80 border-amber-300 dark:border-amber-600'
            : isCompleted
            ? `${theme.borderDefault} ${theme.glowShadow} ${theme.borderHover}`
            : isFailed
            ? 'border-rose-400 dark:border-rose-700 ring-2 ring-rose-400/50'
            : isSkipped
            ? 'opacity-60 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
            : `${theme.borderDefault} ${theme.borderHover}`
        }`}
      >
        {/* Top Accent Stripe with signature gradient */}
        <div className={`h-1.5 w-full ${theme.topStripe}`} />

        <div className="p-4.5">
          {/* Step indicator badge with matching agent color */}
          <div
            className={`absolute -top-3.5 -left-3.5 w-8 h-8 rounded-xl ${theme.stepBadgeBg} text-white flex items-center justify-center text-xs font-black shadow-md border-2 border-white dark:border-slate-850 z-20`}
          >
            {stepNum}
          </div>

          {/* Top & Bottom Ports */}
          {renderPort('top', isRunning || isCompleted, theme.portBg)}
          {renderPort('bottom', isCompleted, theme.portBg)}

          {/* Side ports for Stage 3 & 4 horizontal escalation */}
          {agentId === 'agent5' && renderPort('right', isCompleted, theme.portBg)}
          {agentId === 'agent4_final' && renderPort('left', isRunning || isCompleted, theme.portBg)}

          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl text-white ${theme.iconBg} shadow-md transition-transform group-hover:scale-110 duration-200`}
              >
                {getIcon(agentId)}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${theme.codePill}`}
                  >
                    {agent.codeName}
                  </span>
                  {isFinal && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-extrabold tracking-wide border border-teal-200 dark:border-teal-800">
                      FINAL DECISION
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight mt-1">
                  {agent.name}
                </h4>
              </div>
            </div>
            <div>{getStatusBadge(agent.status, agentId)}</div>
          </div>

          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 mb-3 leading-relaxed">
            {agent.customTask || agent.roleDescription}
          </p>

          {/* Input & Output Indicators with Agent-Specific Tint */}
          <div
            className={`rounded-xl p-2.5 mb-2 border text-[11px] space-y-1.5 ${theme.subtleBoxBg} ${theme.subtleBoxBorder}`}
          >
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="font-bold">Receives:</span>
              <span className="font-mono text-[10px] truncate max-w-[170px] font-medium">
                {inputLabel}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`font-bold ${theme.accentText}`}>Outputs:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                {outputLabel}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-[11px] text-slate-500 dark:text-slate-400">
              {isCompleted ? '✓ Output Ready' : isRunning ? '⚡ Processing...' : 'Click to inspect'}
            </span>
            <span
              className={`font-black group-hover:underline flex items-center gap-1 group-hover:translate-x-0.5 transition-transform ${theme.accentText}`}
            >
              Details &rarr;
            </span>
          </div>
        </div>
      </div>
    );
  };

  // High-contrast, high-visibility conduit styles
  // Inactive: Visible solid dark-slate conduit with sharp outline
  // Active: Vibrant glowing illuminated conduit with halo
  const conduitInactiveStyle =
    'bg-slate-300 dark:bg-slate-700 border-2 border-slate-400/80 dark:border-slate-600/90 shadow-inner';

  return (
    <div className="w-full bg-white/95 dark:bg-slate-900/95 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-xs transition-colors duration-200">
      {/* DIAGRAM HEADER & STATUS CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex h-3.5 w-3.5 rounded-full bg-teal-500 animate-ping" />
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Hospital Multi-Agent Orchestration Architecture
            </h3>
            <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              4-Stage Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Deterministic data flow execution graph across 6 specialized healthcare intelligence agents.
          </p>
        </div>

        {/* HIGH-VISIBILITY PIPELINE LEGEND & AGENT COLOR KEY */}
        <div className="flex items-center gap-2 text-xs flex-wrap font-bold">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider">Conduit State:</span>
            <div className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300">
              <span className="w-3.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 border border-slate-500 inline-block" />
              <span>Ready</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-teal-700 dark:text-teal-300">
              <span className="w-3.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,1)] inline-block" />
              <span>In-Flight Flow</span>
            </div>
          </div>
        </div>
      </div>

      {/* DIAGRAM FLOW CONTAINER */}
      <div className="relative max-w-5xl mx-auto flex flex-col">
        {/* ========================================================= */}
        {/* STAGE 1: TOP - Agent 4 Orchestrator (Planning) */}
        {/* ========================================================= */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {renderAgentBox(
              'agent4_plan',
              1,
              'Manager Question + JS KPIs',
              'Goal + Specialist Directives'
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CONNECTOR 1: HIGH-VISIBILITY ILLUMINATED DISTRIBUTION BUS */}
        {/* ========================================================= */}
        <div className="relative my-2 py-1">
          {/* Vertical primary feeder stem from Agent 4 bottom port */}
          <div className="flex flex-col items-center">
            {/* Primary vertical conduit - 10px wide with high-contrast track */}
            <div
              className={`w-2.5 h-7 rounded-full transition-all duration-300 relative ${
                connector1Active
                  ? `${AGENT_THEMES.agent4_plan.conduitActive} animate-conduit-active`
                  : conduitInactiveStyle
              }`}
            >
              {connector1Active && (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-md animate-ping" />
              )}
            </div>

            {/* Prominent High-Visibility Dispatching Hub Badge */}
            <div
              className={`-my-1 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border-2 z-20 flex items-center gap-1.5 shadow-lg transition-all ${
                connector1Active
                  ? 'bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white border-indigo-300 shadow-indigo-600/40'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-400 dark:border-slate-600'
              }`}
            >
              <GitBranch className="w-4 h-4 stroke-[2.5]" />
              <span>Stage 1 &rarr; Stage 2: Directives Dispatch Bus</span>
              {connector1Active && <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />}
            </div>

            {/* Secondary vertical conduit dropping to horizontal rail */}
            <div
              className={`w-2.5 h-4 rounded-full transition-all duration-300 ${
                connector1Active
                  ? `${AGENT_THEMES.agent4_plan.conduitActive}`
                  : conduitInactiveStyle
              }`}
            />
          </div>

          {/* Symmetrical 4-Column Bus Bar mathematically aligned with the 4 cards below */}
          <div className="hidden lg:grid grid-cols-4 gap-4 px-0">
            {/* Column 1: Branch to Agent 1 (Feedback - Emerald) */}
            <div className="relative h-14">
              {/* Horizontal line from column center to right */}
              <div
                className={`absolute top-0 left-1/2 right-0 h-2.5 rounded-r-full transition-all duration-300 ${
                  connector1Active
                    ? `${AGENT_THEMES.agent1.conduitActive}`
                    : conduitInactiveStyle
                }`}
              />
              {/* Vertical line dropping to Agent 1 (8px wide) */}
              <div
                className={`absolute top-0 left-1/2 w-2.5 h-10 -translate-x-1/2 rounded-full transition-all duration-300 ${
                  connector1Active
                    ? `${AGENT_THEMES.agent1.conduitActive}`
                    : conduitInactiveStyle
                }`}
              />
              {/* Large, High-Visibility Circular Chevron Badge */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 z-20">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-all ${
                    connector1Active
                      ? 'bg-emerald-600 border-emerald-200 text-white shadow-emerald-600/60 ring-4 ring-emerald-500/20 animate-bounce'
                      : 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-500 dark:text-slate-400 shadow-sm'
                  }`}
                  title="Directives for Agent 1"
                >
                  <ArrowDown className="w-4 h-4 stroke-[3.5]" />
                </div>
              </div>
            </div>

            {/* Column 2: Branch to Agent 2 (Monitoring - Amber) */}
            <div className="relative h-14">
              {/* Horizontal line across column */}
              <div
                className={`absolute top-0 left-0 right-0 h-2.5 transition-all duration-300 ${
                  connector1Active
                    ? `${AGENT_THEMES.agent2.conduitActive}`
                    : conduitInactiveStyle
                }`}
              />
              {/* Vertical line dropping to Agent 2 */}
              <div
                className={`absolute top-0 left-1/2 w-2.5 h-10 -translate-x-1/2 rounded-full transition-all duration-300 ${
                  connector1Active
                    ? `${AGENT_THEMES.agent2.conduitActive}`
                    : conduitInactiveStyle
                }`}
              />
              {/* Large, High-Visibility Circular Chevron Badge */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 z-20">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-all ${
                    connector1Active
                      ? 'bg-amber-600 border-amber-200 text-white shadow-amber-600/60 ring-4 ring-amber-500/20 animate-bounce'
                      : 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-500 dark:text-slate-400 shadow-sm'
                  }`}
                  title="Directives for Agent 2"
                >
                  <ArrowDown className="w-4 h-4 stroke-[3.5]" />
                </div>
              </div>
            </div>

            {/* Column 3: Branch to Agent 3 (Triage - Rose) */}
            <div className="relative h-14">
              {/* Horizontal line across column */}
              <div
                className={`absolute top-0 left-0 right-0 h-2.5 transition-all duration-300 ${
                  connector1Active
                    ? `${AGENT_THEMES.agent3.conduitActive}`
                    : conduitInactiveStyle
                }`}
              />
              {/* Vertical line dropping to Agent 3 */}
              <div
                className={`absolute top-0 left-1/2 w-2.5 h-10 -translate-x-1/2 rounded-full transition-all duration-300 ${
                  connector1Active
                    ? `${AGENT_THEMES.agent3.conduitActive}`
                    : conduitInactiveStyle
                }`}
              />
              {/* Large, High-Visibility Circular Chevron Badge */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 z-20">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-all ${
                    connector1Active
                      ? 'bg-rose-600 border-rose-200 text-white shadow-rose-600/60 ring-4 ring-rose-500/20 animate-bounce'
                      : 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-500 dark:text-slate-400 shadow-sm'
                  }`}
                  title="Directives for Agent 3"
                >
                  <ArrowDown className="w-4 h-4 stroke-[3.5]" />
                </div>
              </div>
            </div>

            {/* Column 4: Branch to Agent 6 (Communication - Sky) */}
            <div className="relative h-14">
              {/* Horizontal line from left to column center */}
              <div
                className={`absolute top-0 left-0 right-1/2 h-2.5 rounded-l-full transition-all duration-300 ${
                  connector1Active
                    ? `${AGENT_THEMES.agent6.conduitActive}`
                    : conduitInactiveStyle
                }`}
              />
              {/* Vertical line dropping to Agent 6 */}
              <div
                className={`absolute top-0 left-1/2 w-2.5 h-10 -translate-x-1/2 rounded-full transition-all duration-300 ${
                  connector1Active
                    ? `${AGENT_THEMES.agent6.conduitActive}`
                    : conduitInactiveStyle
                }`}
              />
              {/* Large, High-Visibility Circular Chevron Badge */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 z-20">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-all ${
                    connector1Active
                      ? 'bg-sky-600 border-sky-200 text-white shadow-sky-600/60 ring-4 ring-sky-500/20 animate-bounce'
                      : 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-500 dark:text-slate-400 shadow-sm'
                  }`}
                  title="Directives for Agent 6"
                >
                  <ArrowDown className="w-4 h-4 stroke-[3.5]" />
                </div>
              </div>
            </div>
          </div>

          {/* Responsive connector for mobile/tablets (< lg) */}
          <div className="lg:hidden flex flex-col items-center py-2.5">
            <div
              className={`w-2 h-7 rounded-full ${
                connector1Active
                  ? 'bg-teal-500 dark:bg-teal-400 shadow-[0_0_12px_rgba(20,184,166,1)]'
                  : conduitInactiveStyle
              }`}
            />
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-md -mt-1.5 ${
                connector1Active
                  ? 'bg-teal-600 border-teal-200 text-white shadow-teal-600/50'
                  : 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-400'
              }`}
            >
              <ArrowDown className="w-4 h-4 stroke-[3.5]" />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STAGE 2: MIDDLE - 4 Parallel Specialists */}
        {/* ========================================================= */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 fill-current" />
              Stage 2: Concurrent Specialist Analysis (Parallel Execution)
            </span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Color-Differentiated Specialist Roles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderAgentBox(
              'agent1',
              2,
              'Distinct Comments ({id, text, count})',
              'Themes & Sentiments'
            )}
            {renderAgentBox(
              'agent2',
              2,
              'Demographic Group Metrics',
              'Patterns & Equity Risks'
            )}
            {renderAgentBox(
              'agent3',
              2,
              'Comments + AI Risk Flags',
              'Severity (1-4) & Human Review'
            )}
            {renderAgentBox(
              'agent6',
              2,
              'Comments + Comm. Ratings',
              'Communication Rewrite'
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* CONNECTOR 2: HIGH-VISIBILITY CONVERGENCE BUS TO AGENT 5 */}
        {/* ========================================================= */}
        <div className="relative my-2 py-1">
          {/* Responsive connector for mobile/tablets (< lg) */}
          <div className="lg:hidden flex flex-col items-center py-2.5">
            <div
              className={`w-2 h-7 rounded-full ${
                connector2Active
                  ? 'bg-purple-500 dark:bg-purple-400 shadow-[0_0_12px_rgba(168,85,247,1)]'
                  : conduitInactiveStyle
              }`}
            />
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-md -mt-1.5 ${
                connector2Active
                  ? 'bg-purple-600 border-purple-200 text-white shadow-purple-600/50'
                  : 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-400'
              }`}
            >
              <ArrowDown className="w-4 h-4 stroke-[3.5]" />
            </div>
          </div>

          {/* Symmetrical 4-Column Convergence Bar collecting from 4 cards */}
          <div className="hidden lg:grid grid-cols-4 gap-4 px-0">
            {/* Column 1: From Agent 1 down (Emerald rail) */}
            <div className="relative h-12">
              <div
                className={`absolute top-0 bottom-0 left-1/2 w-2.5 -translate-x-1/2 rounded-full transition-all duration-300 ${
                  connector2Active
                    ? `${AGENT_THEMES.agent1.conduitActive}`
                    : conduitInactiveStyle
                }`}
              />
              <div
                className={`absolute bottom-0 left-1/2 right-0 h-2.5 rounded-r-full transition-all duration-300 ${
                  connector2Active
                    ? `${AGENT_THEMES.agent5.conduitActive}`
                    : conduitInactiveStyle
                }`}
              />
            </div>

            {/* Column 2: From Agent 2 down (Amber rail) */}
            <div className="relative h-12">
              <div
                className={`absolute top-0 bottom-0 left-1/2 w-2.5 -translate-x-1/2 rounded-full transition-all duration-300 ${
                  connector2Active
                    ? `${AGENT_THEMES.agent2.conduitActive}`
                    : conduitInactiveStyle
                }`}
              />
              <div
                className={`absolute bottom-0 left-0 right-0 h-2.5 transition-all duration-300 ${
                  connector2Active
                    ? `${AGENT_THEMES.agent5.conduitActive}`
                    : conduitInactiveStyle
                }`}
              />
            </div>

            {/* Column 3: From Agent 3 down (Rose rail) */}
            <div className="relative h-12">
              <div
                className={`absolute top-0 bottom-0 left-1/2 w-2.5 -translate-x-1/2 rounded-full transition-all duration-300 ${
                  connector2Active
                    ? `${AGENT_THEMES.agent3.conduitActive}`
                    : conduitInactiveStyle
                }`}
              />
              <div
                className={`absolute bottom-0 left-0 right-0 h-2.5 transition-all duration-300 ${
                  connector2Active
                    ? `${AGENT_THEMES.agent5.conduitActive}`
                    : conduitInactiveStyle
                }`}
              />
            </div>

            {/* Column 4: From Agent 6 down (Sky rail) */}
            <div className="relative h-12">
              <div
                className={`absolute top-0 bottom-0 left-1/2 w-2.5 -translate-x-1/2 rounded-full transition-all duration-300 ${
                  connector2Active
                    ? `${AGENT_THEMES.agent6.conduitActive}`
                    : conduitInactiveStyle
                }`}
              />
              <div
                className={`absolute bottom-0 left-0 right-1/2 h-2.5 rounded-l-full transition-all duration-300 ${
                  connector2Active
                    ? `${AGENT_THEMES.agent5.conduitActive}`
                    : conduitInactiveStyle
                }`}
              />
            </div>
          </div>

          {/* Central convergence node and feeder line dropping directly into Agent 5 */}
          <div className="hidden lg:grid grid-cols-2 gap-4 -mt-1">
            <div className="flex flex-col items-center">
              {/* Convergence Hub Tag */}
              <div
                className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border-2 z-20 flex items-center gap-1.5 shadow-lg transition-all ${
                  connector2Active
                    ? 'bg-gradient-to-r from-purple-700 via-purple-600 to-fuchsia-700 text-white border-purple-300 shadow-purple-600/40'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-400 dark:border-slate-600'
                }`}
              >
                <GitMerge className="w-4 h-4 stroke-[2.5]" />
                <span>Stage 2 &rarr; Stage 3: Multi-Agent Synthesis Hub</span>
              </div>

              {/* Vertical feeder conduit dropping into Agent 5 (10px wide) */}
              <div
                className={`w-2.5 h-6 rounded-full transition-all duration-300 ${
                  connector2Active
                    ? `${AGENT_THEMES.agent5.conduitActive} animate-conduit-active`
                    : conduitInactiveStyle
                }`}
              />

              {/* High-visibility purple chevron badge */}
              <div className="z-20 -mt-1">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-all ${
                    connector2Active
                      ? 'bg-purple-600 border-purple-200 text-white shadow-purple-600/60 ring-4 ring-purple-500/20 animate-bounce'
                      : 'bg-white dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-500 dark:text-slate-400 shadow-sm'
                  }`}
                  title="Deliver all specialist results to Executive Analytics"
                >
                  <ArrowDown className="w-4 h-4 stroke-[3.5]" />
                </div>
              </div>
            </div>
            {/* Empty right column maintains perfect mathematical alignment */}
            <div />
          </div>
        </div>

        {/* ========================================================= */}
        {/* STAGES 3 & 4: BOTTOM - Agent 5 Analytics & Agent 4 Final Decision */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch pt-2">
          {/* STAGE 3: Agent 5 Analytics (Purple Theme) */}
          <div className="relative flex flex-col justify-between">
            {renderAgentBox(
              'agent5',
              3,
              'All 4 Approved Specialist Results',
              'Priorities + Quick Wins + AI Ideas'
            )}
          </div>

          {/* MOBILE CONNECTOR between Stage 3 and Stage 4 (< md) */}
          <div className="md:hidden flex flex-col items-center py-2.5 my-1">
            <div
              className={`w-2 h-7 rounded-full ${
                connector3Active
                  ? 'bg-teal-500 dark:bg-teal-400 shadow-[0_0_12px_rgba(20,184,166,1)]'
                  : conduitInactiveStyle
              }`}
            />
            <div
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 z-20 flex items-center gap-1 shadow-md my-1 ${
                connector3Active
                  ? 'bg-teal-700 text-white border-teal-300'
                  : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-400'
              }`}
            >
              <span>Escalate to Executive</span>
              <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          {/* STAGE 4: Agent 4 Final Decision (Deep Teal Theme) */}
          <div className="relative flex flex-col justify-between">
            {/* HIGH-VISIBILITY ILLUMINATED HORIZONTAL DATA BRIDGE between Agent 5 and Agent 4 Final */}
            <div className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-30 items-center justify-center w-5">
              {/* Glowing horizontal pipe track passing directly between docking ports */}
              <div
                className={`absolute w-10 h-2.5 -left-2.5 rounded-full transition-all duration-300 ${
                  connector3Active
                    ? 'bg-gradient-to-r from-purple-500 via-teal-400 to-teal-500 shadow-[0_0_16px_rgba(20,184,166,1)] animate-conduit-active'
                    : conduitInactiveStyle
                }`}
              />

              {/* Prominent High-Visibility Central Bridge Badge */}
              <div
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border-2 shadow-xl transition-all whitespace-nowrap ${
                  connector3Active
                    ? 'bg-gradient-to-r from-purple-700 to-teal-700 text-white border-teal-300 shadow-[0_0_16px_rgba(20,184,166,0.7)] ring-4 ring-teal-500/20 animate-pulse'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-400 dark:border-slate-600'
                }`}
              >
                <span>Synthesize</span>
                <ArrowRight className="w-4 h-4 stroke-[3.5]" />
              </div>
            </div>

            {renderAgentBox(
              'agent4_final',
              4,
              'Analytics Insights + Human Escalations',
              'Executive Alert & Recommendations',
              true
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
