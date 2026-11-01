import Papa from 'papaparse';
import { PatientRecord } from '../types/agents';

export interface ParseResult {
  success: boolean;
  records: PatientRecord[];
  detectedColumns: string[];
  message: string;
}

/**
 * Normalizes an object's keys for flexible fuzzy matching
 */
function findVal(row: Record<string, any>, possibleKeys: string[]): any {
  const rowKeys = Object.keys(row);
  for (const target of possibleKeys) {
    const targetNorm = target.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const key of rowKeys) {
      const keyNorm = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (keyNorm === targetNorm || keyNorm.includes(targetNorm)) {
        if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
          return row[key];
        }
      }
    }
  }
  return undefined;
}

/**
 * Universal file parser supporting CSV, TSV, JSON, and line-delimited TXT files.
 */
export async function parseUploadedFile(file: File): Promise<ParseResult> {
  const fileName = file.name.toLowerCase();

  // 1. JSON file handler
  if (fileName.endsWith('.json')) {
    try {
      const text = await file.text();
      const raw = JSON.parse(text);
      const items = Array.isArray(raw) ? raw : raw.records || raw.data || [raw];
      const records = mapRowsToPatientRecords(items);
      return {
        success: true,
        records,
        detectedColumns: records.length > 0 ? Object.keys(records[0]) : [],
        message: `Parsed ${records.length} records from JSON file.`,
      };
    } catch (err: any) {
      return {
        success: false,
        records: [],
        detectedColumns: [],
        message: `Failed to parse JSON file: ${err.message}`,
      };
    }
  }

  // 2. CSV / TSV / Generic Delimited text handler
  return new Promise<ParseResult>((resolve) => {
    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        // If Papa parse parsed headers and rows successfully
        if (results.data && results.data.length > 0 && Object.keys(results.data[0]).length > 1) {
          const records = mapRowsToPatientRecords(results.data);
          resolve({
            success: true,
            records,
            detectedColumns: Object.keys(results.data[0]),
            message: `Loaded ${records.length} records from ${file.name}.`,
          });
          return;
        }

        // If it was a plain TXT file or single-column lines (e.g. comments list)
        file.text().then((rawText) => {
          const lines = rawText
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => l.length > 5 && !l.startsWith('#'));

          if (lines.length === 0) {
            resolve({
              success: false,
              records: [],
              detectedColumns: [],
              message: `The uploaded file ${file.name} appears to be empty or unreadable.`,
            });
            return;
          }

          // Convert text lines into valid PatientRecords with comments
          const records: PatientRecord[] = lines.map((comment, idx) => ({
            Record_ID: `REC-UPLOAD-${idx + 101}`,
            Patient_Persona: 'Survey Respondent',
            Age_Group: idx % 3 === 0 ? '65+' : idx % 2 === 0 ? '45-64' : '18-44',
            Visit_Type: idx % 2 === 0 ? 'Inpatient' : 'Outpatient',
            Service_Line:
              idx % 4 === 0
                ? 'Cardiology'
                : idx % 3 === 0
                ? 'Emergency'
                : idx % 2 === 0
                ? 'Orthopedics'
                : 'General Medicine',
            Year: 2025,
            Patient_Satisfaction: comment.toLowerCase().includes('good') || comment.toLowerCase().includes('great') || comment.toLowerCase().includes('thank') ? 8 : 4,
            Communication_Rating: comment.toLowerCase().includes('doctor') || comment.toLowerCase().includes('nurse') ? 6 : 4,
            Followup_Compliance: 1,
            Portal_Usage: idx % 2 === 0 ? 1 : 0,
            Readmission_Risk: comment.toLowerCase().includes('pain') || comment.toLowerCase().includes('fall') ? 'High' : 'Medium',
            AI_Risk_Flag: comment.toLowerCase().includes('wrong') || comment.toLowerCase().includes('error') || comment.toLowerCase().includes('wait') ? 'High' : 'None',
            Comment: comment,
          }));

          resolve({
            success: true,
            records,
            detectedColumns: ['Comment', 'Inferred Fields'],
            message: `Extracted ${records.length} comments from text file ${file.name}.`,
          });
        });
      },
      error: (err) => {
        resolve({
          success: false,
          records: [],
          detectedColumns: [],
          message: `CSV parsing error: ${err.message}`,
        });
      },
    });
  });
}

/**
 * Maps raw CSV/JSON rows into standardized PatientRecord schema using smart fuzzy key matching
 */
function mapRowsToPatientRecords(rows: Record<string, any>[]): PatientRecord[] {
  return rows.map((row, idx) => {
    const rawId = findVal(row, ['recordid', 'id', 'record', 'patientid']);
    const persona = findVal(row, ['patientpersona', 'persona', 'category', 'patienttype']) || 'General Patient';
    const ageGroup = findVal(row, ['agegroup', 'age', 'cohort']) || '45-64';
    const visitType = findVal(row, ['visittype', 'encountertype', 'type', 'visit']) || 'Inpatient';
    const serviceLine = findVal(row, ['serviceline', 'department', 'unit', 'clinic', 'specialty']) || 'General Medicine';
    const year = Number(findVal(row, ['year', 'date'])) || 2025;

    const sat = Number(findVal(row, ['patientsatisfaction', 'satisfaction', 'score', 'rating', 'hps'])) || 5;
    const comm = Number(findVal(row, ['communicationrating', 'communication', 'doctorcomm', 'nursecomm'])) || 5;

    const complianceVal = findVal(row, ['followupcompliance', 'compliance', 'followup', 'adherence']);
    const compliance = complianceVal === 1 || String(complianceVal).toLowerCase() === 'yes' || String(complianceVal).toLowerCase() === 'true' ? 1 : 0;

    const portalVal = findVal(row, ['portalusage', 'portal', 'mychart', 'online']);
    const portal = portalVal === 1 || String(portalVal).toLowerCase() === 'yes' || String(portalVal).toLowerCase() === 'true' ? 1 : 0;

    const riskVal = String(findVal(row, ['readmissionrisk', 'risk', 'severity']) || 'Medium');
    const readmissionRisk = ['Low', 'Medium', 'High'].includes(riskVal) ? (riskVal as 'Low' | 'Medium' | 'High') : 'Medium';

    const flagVal = String(findVal(row, ['airiskflag', 'riskflag', 'flag', 'alert']) || 'None');
    const aiRiskFlag = ['None', 'Moderate', 'High', 'Critical'].includes(flagVal) ? (flagVal as 'None' | 'Moderate' | 'High' | 'Critical') : 'None';

    const comment = findVal(row, ['comment', 'feedback', 'notes', 'text', 'narrative', 'review', 'complaint']) || 'No comment provided';

    return {
      Record_ID: rawId ? String(rawId) : `REC-UP-${idx + 101}`,
      Patient_Persona: String(persona),
      Age_Group: String(ageGroup),
      Visit_Type: String(visitType),
      Service_Line: String(serviceLine),
      Year: year,
      Patient_Satisfaction: Math.min(10, Math.max(1, sat)),
      Communication_Rating: Math.min(10, Math.max(1, comm)),
      Followup_Compliance: compliance,
      Portal_Usage: portal,
      Readmission_Risk: readmissionRisk,
      AI_Risk_Flag: aiRiskFlag,
      Comment: String(comment),
    };
  });
}
