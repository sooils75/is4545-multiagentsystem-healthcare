import { CalculatedKPIs, DistinctComment, PatientRecord } from '../types/agents';

/**
 * Calculates all KPIs strictly in pure JavaScript (never with AI) as per prompt requirements.
 */
export function calculateKPIs(records: PatientRecord[]): CalculatedKPIs {
  const total = records.length;
  if (total === 0) {
    return {
      totalRecords: 0,
      avgSatisfaction: 0,
      avgCommunicationRating: 0,
      followupComplianceRate: 0,
      portalUsageRate: 0,
      satisfactionByServiceLine: {},
      satisfactionByYear: {},
      countsByReadmissionRisk: {},
      countsByAIRiskFlag: {},
      groupedAverages: {
        byPersona: {},
        byAgeGroup: {},
        byVisitType: {},
        byServiceLine: {},
        byYear: {},
      },
    };
  }

  let totalSat = 0;
  let totalComm = 0;
  let totalFollowup = 0;
  let totalPortal = 0;

  const satByServiceLineAcc: Record<string, { sum: number; count: number }> = {};
  const satByYearAcc: Record<string, { sum: number; count: number }> = {};
  const countsByReadmissionRisk: Record<string, number> = {};
  const countsByAIRiskFlag: Record<string, number> = {};

  const buildGroupAccumulator = () => ({
    sumSat: 0,
    sumComm: 0,
    count: 0,
    sumFollowup: 0,
    sumPortal: 0,
  });

  const byPersonaAcc: Record<string, ReturnType<typeof buildGroupAccumulator>> = {};
  const byAgeGroupAcc: Record<string, ReturnType<typeof buildGroupAccumulator>> = {};
  const byVisitTypeAcc: Record<string, ReturnType<typeof buildGroupAccumulator>> = {};
  const byServiceLineAcc: Record<string, ReturnType<typeof buildGroupAccumulator>> = {};
  const byYearAcc: Record<string, ReturnType<typeof buildGroupAccumulator>> = {};

  for (const r of records) {
    const sat = Number(r.Patient_Satisfaction) || 0;
    const comm = Number(r.Communication_Rating) || 0;
    const follow = Number(r.Followup_Compliance) === 1 ? 1 : 0;
    const portal = Number(r.Portal_Usage) === 1 ? 1 : 0;

    totalSat += sat;
    totalComm += comm;
    totalFollowup += follow;
    totalPortal += portal;

    // Service line satisfaction
    const sl = r.Service_Line || 'Unspecified';
    if (!satByServiceLineAcc[sl]) satByServiceLineAcc[sl] = { sum: 0, count: 0 };
    satByServiceLineAcc[sl].sum += sat;
    satByServiceLineAcc[sl].count += 1;

    // Year satisfaction
    const yr = String(r.Year || 'Unknown');
    if (!satByYearAcc[yr]) satByYearAcc[yr] = { sum: 0, count: 0 };
    satByYearAcc[yr].sum += sat;
    satByYearAcc[yr].count += 1;

    // Counts
    const readm = r.Readmission_Risk || 'Unspecified';
    countsByReadmissionRisk[readm] = (countsByReadmissionRisk[readm] || 0) + 1;

    const flag = r.AI_Risk_Flag || 'None';
    countsByAIRiskFlag[flag] = (countsByAIRiskFlag[flag] || 0) + 1;

    // Grouped metrics
    const addToGroup = (acc: Record<string, ReturnType<typeof buildGroupAccumulator>>, key: string) => {
      if (!acc[key]) acc[key] = buildGroupAccumulator();
      acc[key].sumSat += sat;
      acc[key].sumComm += comm;
      acc[key].count += 1;
      acc[key].sumFollowup += follow;
      acc[key].sumPortal += portal;
    };

    addToGroup(byPersonaAcc, r.Patient_Persona || 'General');
    addToGroup(byAgeGroupAcc, r.Age_Group || 'Unspecified');
    addToGroup(byVisitTypeAcc, r.Visit_Type || 'General');
    addToGroup(byServiceLineAcc, sl);
    addToGroup(byYearAcc, yr);
  }

  const satisfactionByServiceLine: Record<string, number> = {};
  for (const [k, v] of Object.entries(satByServiceLineAcc)) {
    satisfactionByServiceLine[k] = Number((v.sum / v.count).toFixed(2));
  }

  const satisfactionByYear: Record<string, number> = {};
  for (const [k, v] of Object.entries(satByYearAcc)) {
    satisfactionByYear[k] = Number((v.sum / v.count).toFixed(2));
  }

  const finalizeGroup = (acc: Record<string, ReturnType<typeof buildGroupAccumulator>>) => {
    const res: Record<string, { satisfaction: number; communication: number; count: number; followUpRate: number; portalRate: number }> = {};
    for (const [k, v] of Object.entries(acc)) {
      res[k] = {
        satisfaction: Number((v.sumSat / v.count).toFixed(2)),
        communication: Number((v.sumComm / v.count).toFixed(2)),
        count: v.count,
        followUpRate: Math.round((v.sumFollowup / v.count) * 100),
        portalRate: Math.round((v.sumPortal / v.count) * 100),
      };
    }
    return res;
  };

  return {
    totalRecords: total,
    avgSatisfaction: Number((totalSat / total).toFixed(2)),
    avgCommunicationRating: Number((totalComm / total).toFixed(2)),
    followupComplianceRate: Math.round((totalFollowup / total) * 100),
    portalUsageRate: Math.round((totalPortal / total) * 100),
    satisfactionByServiceLine,
    satisfactionByYear,
    countsByReadmissionRisk,
    countsByAIRiskFlag,
    groupedAverages: {
      byPersona: finalizeGroup(byPersonaAcc),
      byAgeGroup: finalizeGroup(byAgeGroupAcc),
      byVisitType: finalizeGroup(byVisitTypeAcc),
      byServiceLine: finalizeGroup(byServiceLineAcc),
      byYear: finalizeGroup(byYearAcc),
    },
  };
}

/**
 * Extracts distinct comments from records with record counts, communication averages,
 * and AI_Risk_Flag distributions.
 */
export function extractDistinctComments(records: PatientRecord[]): DistinctComment[] {
  const map = new Map<
    string,
    {
      comment: string;
      recordIds: string[];
      sumComm: number;
      riskFlagCounts: Record<string, number>;
    }
  >();

  for (const r of records) {
    const rawComment = (r.Comment || '').trim();
    if (!rawComment) continue;

    const existing = map.get(rawComment);
    const comm = Number(r.Communication_Rating) || 0;
    const flag = r.AI_Risk_Flag || 'None';

    if (existing) {
      existing.recordIds.push(r.Record_ID);
      existing.sumComm += comm;
      existing.riskFlagCounts[flag] = (existing.riskFlagCounts[flag] || 0) + 1;
    } else {
      map.set(rawComment, {
        comment: rawComment,
        recordIds: [r.Record_ID],
        sumComm: comm,
        riskFlagCounts: { [flag]: 1 },
      });
    }
  }

  const results: DistinctComment[] = [];
  let index = 1;
  for (const [, item] of map.entries()) {
    results.push({
      id: `C${index}`,
      comment: item.comment,
      count: item.recordIds.length,
      recordIds: item.recordIds,
      avgCommunicationRating: Number((item.sumComm / item.recordIds.length).toFixed(1)),
      riskFlagCounts: item.riskFlagCounts,
    });
    index++;
  }

  return results;
}
