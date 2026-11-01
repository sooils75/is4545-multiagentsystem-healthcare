import React from 'react';
import { HelpCircle, MessageSquare, Sparkles } from 'lucide-react';

interface ManagerQuestionBarProps {
  question: string;
  onChangeQuestion: (q: string) => void;
  selectedCount: number;
  distinctCommentCount: number;
  disabled?: boolean;
}

const PRESET_QUESTIONS = [
  'What should management fix first to improve patient experience, and which cases need human review?',
  'Identify top equity, accessibility, and language barriers impacting our patients.',
  'Which communication breakdowns pose the most critical clinical safety risks?',
  'Analyze tech portal barriers and billing confusion hurting patient compliance.',
];

export const ManagerQuestionBar: React.FC<ManagerQuestionBarProps> = ({
  question,
  onChangeQuestion,
  selectedCount,
  distinctCommentCount,
  disabled = false,
}) => {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <label
          htmlFor="manager-question-input"
          className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2"
        >
          <div className="p-1 rounded-md bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          Manager&apos;s Inquiry / Objective for Agent 4 Orchestrator
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          Active Scope:{' '}
          <strong className="text-teal-700 dark:text-teal-300 font-bold">
            {selectedCount} records
          </strong>{' '}
          ({distinctCommentCount} distinct comments)
        </span>
      </div>

      <div className="relative">
        <textarea
          id="manager-question-input"
          rows={2}
          disabled={disabled}
          value={question}
          onChange={(e) => onChangeQuestion(e.target.value)}
          placeholder="Enter the executive or operational question for the multi-agent hospital team..."
          className="w-full text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 focus:outline-hidden resize-none leading-relaxed transition-all shadow-inner"
        />
      </div>

      {/* QUICK PRESETS */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5 text-xs mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Suggested Inquiries:
        </span>
        {PRESET_QUESTIONS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onChangeQuestion(preset)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-medium truncate max-w-sm ${
              question === preset
                ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-200 font-bold shadow-2xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
            title={preset}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
};
