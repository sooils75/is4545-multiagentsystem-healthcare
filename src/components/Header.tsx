import React, { useRef } from 'react';
import { RunMode } from '../types/agents';
import {
  Download,
  FileSpreadsheet,
  HeartPulse,
  Moon,
  Play,
  RotateCw,
  Sliders,
  Sun,
  Upload,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  runMode: RunMode;
  onChangeRunMode: (mode: RunMode) => void;
  isRunning: boolean;
  onRunWorkflow: () => void;
  onResetWorkflow: () => void;
  onUploadCSV: (file: File) => void;
  onLoadSampleData: () => void;
  onDownloadCSV: () => void;
  currentStepLabel?: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  runMode,
  onChangeRunMode,
  isRunning,
  onRunWorkflow,
  onResetWorkflow,
  onUploadCSV,
  onLoadSampleData,
  onDownloadCSV,
  currentStepLabel,
  theme,
  onToggleTheme,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadCSV(file);
      e.target.value = '';
    }
  };

  return (
    <header className="bg-white/90 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* LOGO & TITLE */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative h-11 w-11 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-700/25">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                Hospital Patient Experience Intelligence System
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-teal-500/15 to-emerald-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping"></span>
                6-Agent Team
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Autonomous orchestration of feedback, monitoring, triage, communication, and executive analytics
            </p>
          </div>
        </div>

        {/* CONTROLS & ACTIONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* RUN MODE TOGGLE */}
          <div className="bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
            <button
              type="button"
              disabled={isRunning}
              onClick={() => onChangeRunMode('auto')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                runMode === 'auto'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Runs all four steps uninterrupted"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-500" />
              Auto Run
            </button>
            <button
              type="button"
              disabled={isRunning}
              onClick={() => onChangeRunMode('step_by_step')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                runMode === 'step_by_step'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Pauses after each step for human review and customization"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              Step-by-Step Review
            </button>
          </div>

          {/* DATASET ACTIONS */}
          <div className="flex items-center gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={isRunning}
              onClick={() => fileInputRef.current?.click()}
              className="p-2 sm:px-2.5 sm:py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
              title="Upload custom CSV dataset"
            >
              <Upload className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">Upload CSV</span>
            </button>

            <button
              type="button"
              disabled={isRunning}
              onClick={onLoadSampleData}
              className="p-2 sm:px-2.5 sm:py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
              title="Reload sample synthetic dataset"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">Sample Data</span>
            </button>

            <button
              type="button"
              disabled={isRunning}
              onClick={onDownloadCSV}
              className="p-2 sm:px-2 sm:py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
              title="Download current records as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* DARK / LIGHT MODE TOGGLE */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark Mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* PRIMARY RUN WORKFLOW BUTTON */}
          <button
            type="button"
            disabled={isRunning}
            onClick={onRunWorkflow}
            className="relative group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 active:scale-95 text-white font-extrabold rounded-xl shadow-md shadow-teal-600/30 transition-all text-xs cursor-pointer disabled:opacity-50 overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            {isRunning ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-teal-200" />
                <span>{currentStepLabel || 'Running Multi-Agent System...'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-teal-200 group-hover:scale-110 transition-transform" />
                <span>Run Workflow</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
