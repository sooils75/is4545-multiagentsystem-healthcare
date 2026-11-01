import React, { useState, useMemo } from 'react';
import {
  Agent1Result,
  Agent3Result,
  DistinctComment,
  PatientRecord,
} from '../types/agents';
import {
  Search,
  CheckSquare,
  Square,
  AlertTriangle,
} from 'lucide-react';

interface DataTableProps {
  records: PatientRecord[];
  selectedRecordIds: Set<string>;
  onToggleSelectRecord: (id: string) => void;
  onToggleSelectAll: () => void;
  distinctComments: DistinctComment[];
  agent1Result: Agent1Result | null;
  agent3Result: Agent3Result | null;
}

export const DataTable: React.FC<DataTableProps> = ({
  records,
  selectedRecordIds,
  onToggleSelectRecord,
  onToggleSelectAll,
  distinctComments,
  agent1Result,
  agent3Result,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceLineFilter, setServiceLineFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [humanReviewOnly, setHumanReviewOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Build comment enrichments mapping: raw comment text -> { theme, sentiment, severity, humanReview, routeTo }
  const enrichmentMap = useMemo(() => {
    const map = new Map<
      string,
      {
        id?: string;
        theme?: string;
        sentiment?: string;
        severity?: number;
        humanReview?: boolean;
        routeTo?: string;
      }
    >();

    for (const dc of distinctComments) {
      const entry: {
        id?: string;
        theme?: string;
        sentiment?: string;
        severity?: number;
        humanReview?: boolean;
        routeTo?: string;
      } = { id: dc.id };

      if (agent1Result?.comments) {
        const a1 = agent1Result.comments.find((c) => c.id === dc.id);
        if (a1) {
          entry.theme = a1.theme;
          entry.sentiment = a1.sentiment;
        }
      }

      if (agent3Result?.comments) {
        const a3 = agent3Result.comments.find((c) => c.id === dc.id);
        if (a3) {
          entry.severity = a3.severity;
          entry.humanReview = a3.human_review;
          entry.routeTo = a3.route_to;
        }
      }

      map.set(dc.comment.trim(), entry);
    }

    return map;
  }, [distinctComments, agent1Result, agent3Result]);

  const serviceLines = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => r.Service_Line && set.add(r.Service_Line));
    return Array.from(set);
  }, [records]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matches =
          r.Record_ID.toLowerCase().includes(query) ||
          r.Comment.toLowerCase().includes(query) ||
          r.Patient_Persona.toLowerCase().includes(query) ||
          r.Service_Line.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Service line filter
      if (serviceLineFilter !== 'ALL' && r.Service_Line !== serviceLineFilter) {
        return false;
      }

      // Risk filter
      if (riskFilter !== 'ALL' && r.AI_Risk_Flag !== riskFilter) {
        return false;
      }

      // Human review filter
      if (humanReviewOnly) {
        const enriched = enrichmentMap.get(r.Comment.trim());
        if (!enriched || !enriched.humanReview) {
          return false;
        }
      }

      return true;
    });
  }, [records, searchTerm, serviceLineFilter, riskFilter, humanReviewOnly, enrichmentMap]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page, pageSize]);

  const allSelected =
    records.length > 0 && selectedRecordIds.size === records.length;

  return (
    <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-colors duration-200">
      {/* FILTER & SEARCH BAR */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Hospital Patient Experience Records Dataset
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Showing {filteredRecords.length} records • Selected <strong className="text-teal-700 dark:text-teal-400">{selectedRecordIds.size} of {records.length}</strong> records for multi-agent processing
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onToggleSelectAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs cursor-pointer"
            >
              {allSelected ? (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-500" />
                  Deselect All
                </>
              ) : (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Select All Records
                </>
              )}
            </button>
          </div>
        </div>

        {/* INPUT FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search comments, ID, persona..."
              className="w-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-teal-600 dark:focus:border-teal-400"
            />
          </div>

          {/* Service Line Dropdown */}
          <div>
            <select
              value={serviceLineFilter}
              onChange={(e) => {
                setServiceLineFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-teal-600 dark:focus:border-teal-400"
            >
              <option value="ALL">All Service Lines</option>
              {serviceLines.map((sl) => (
                <option key={sl} value={sl}>
                  {sl}
                </option>
              ))}
            </select>
          </div>

          {/* AI Risk Flag Filter */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-teal-600 dark:focus:border-teal-400"
            >
              <option value="ALL">All Risk Flags</option>
              <option value="None">None</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Human Review Checkbox filter */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl w-full">
              <input
                type="checkbox"
                checked={humanReviewOnly}
                onChange={(e) => {
                  setHumanReviewOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500"
              />
              <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                Human Review Only
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-3 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Record ID</th>
              <th className="py-3 px-3">Persona &amp; Group</th>
              <th className="py-3 px-3">Service Line</th>
              <th className="py-3 px-2 text-center">Satisfaction</th>
              <th className="py-3 px-2 text-center">Comm.</th>
              <th className="py-3 px-2 text-center">Compliance</th>
              <th className="py-3 px-2 text-center">Risk Flag</th>
              <th className="py-3 px-4 min-w-[280px]">Patient Comment</th>
              <th className="py-3 px-3 min-w-[200px]">Agent Intelligence Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-sans">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                  No records match the current filters.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((r) => {
                const isSelected = selectedRecordIds.has(r.Record_ID);
                const enriched = enrichmentMap.get(r.Comment.trim());

                return (
                  <tr
                    key={r.Record_ID}
                    onClick={() => onToggleSelectRecord(r.Record_ID)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'hover:bg-teal-50/40 dark:hover:bg-teal-950/20'
                        : 'opacity-50 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectRecord(r.Record_ID)}
                        className="rounded border-slate-300 dark:border-slate-700 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {r.Record_ID}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">{r.Patient_Persona}</div>
                      <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        {r.Age_Group} • {r.Visit_Type}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">
                      {r.Service_Line}
                    </td>
                    <td className="py-3 px-2 text-center font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-black ${
                          r.Patient_Satisfaction >= 8
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : r.Patient_Satisfaction >= 5
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {r.Patient_Satisfaction}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-black ${
                          r.Communication_Rating >= 8
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : r.Communication_Rating >= 5
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {r.Communication_Rating}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-[10px] whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-center">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold ${
                            r.Followup_Compliance === 1
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Follow-up: {r.Followup_Compliance === 1 ? 'Yes' : 'No'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold ${
                            r.Portal_Usage === 1
                              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Portal: {r.Portal_Usage === 1 ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          r.AI_Risk_Flag === 'Critical'
                            ? 'bg-red-700 text-white'
                            : r.AI_Risk_Flag === 'High'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            : r.AI_Risk_Flag === 'Moderate'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {r.AI_Risk_Flag}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      &ldquo;{r.Comment}&rdquo;
                    </td>
                    <td className="py-3 px-3">
                      {enriched ? (
                        <div className="flex flex-col gap-1 text-[10px]">
                          <div className="flex flex-wrap items-center gap-1">
                            {enriched.id && (
                              <span className="font-mono bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-1.5 py-0.2 rounded font-black border border-teal-200 dark:border-teal-800">
                                {enriched.id}
                              </span>
                            )}
                            {enriched.theme && (
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.2 rounded font-bold">
                                {enriched.theme}
                              </span>
                            )}
                            {enriched.sentiment && (
                              <span
                                className={`px-2 py-0.2 rounded font-black ${
                                  enriched.sentiment === 'Positive'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                }`}
                              >
                                {enriched.sentiment}
                              </span>
                            )}
                          </div>
                          {enriched.severity && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`px-2 py-0.2 rounded font-black ${
                                  enriched.severity >= 3
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                Severity {enriched.severity}
                              </span>
                              {enriched.humanReview && (
                                <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 px-2 py-0.2 rounded font-black flex items-center gap-1 border border-rose-300 dark:border-rose-800">
                                  <AlertTriangle className="w-3 h-3" />
                                  Human Review
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                          Awaiting agent runs
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span>
          Page {page} of {totalPages} ({filteredRecords.length} filtered records)
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-750 disabled:opacity-40 cursor-pointer shadow-2xs"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-750 disabled:opacity-40 cursor-pointer shadow-2xs"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
