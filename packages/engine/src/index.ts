import { Schedule } from "krsplan-engine";
import { MeetingRaw, ClassScheduleRaw, SubjectRaw } from "./base-types";

export { Schedule };
export type { MeetingRaw, ClassScheduleRaw, SubjectRaw };

function normalizeTime(timeStr: string): string {
  if (!timeStr) return "00:00";
  const parts = timeStr.split(":");
  if (parts.length === 1) return `${parts[0].padStart(2, '0')}:00`;
  const hours = parts[0].trim();
  const minutes = parts[1].trim();
  return `${hours.padStart(2, '0')}:${(minutes || "00").padStart(2, '0')}`;
}

export interface BimaParseResult {
  subjects: SubjectRaw[];
  debug: {
    formatA: number;
    formatB: number;
    unknown: number;
    lecturerLines: number;
  };
}

export function parseBimaMasterText(text: string): SubjectRaw[] {
  const result = parseBimaMasterWithDebug(text);
  return result.subjects;
}

export function parseBimaMasterWithDebug(text: string): BimaParseResult {
  const lines = text.split("\n").filter(l => l.trim().length > 0);
  const subjectsMap: Record<string, SubjectRaw> = {};
  const debug = { formatA: 0, formatB: 0, unknown: 0, lecturerLines: 0 };

  let currentClass: ClassScheduleRaw | null = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    // Strategy 1: Tab or multi-space (Robust Format A)
    let columns = line.split(/\t|\s{2,}/);

    // Strategy 2: If brittle space-delimited (Format B)
    if (columns.length < 7 && line.startsWith("SISTEM INFORMASI")) {
      const parts = line.split(/\s+/);
      if (parts.length >= 9) {
        let classIndex = -1;
        for (let j = 3; j < parts.length; j++) {
          if (/^SI-[A-Z0-9]+$/.test(parts[j])) {
            classIndex = j;
            break;
          }
        }
        if (classIndex !== -1) {
          columns = [
            "SISTEM INFORMASI",
            parts[2], // CODE
            parts.slice(3, classIndex).join(" "), // NAME
            parts[classIndex], // CLASS
            parts[classIndex + 1], // SKS
            parts[classIndex + 2], // CAPACITY
            parts[classIndex + 3] + " " + parts[classIndex + 4], // DAY TIME
            parts[classIndex + 5] // ROOM
          ];
        }
      }
    }

    // Schema detection
    // Format A: [0]PRODI [1]CODE [2]NAME [3]SKS [4]CLASS [5]... [6]DAY TIME [7]ROOM
    // Format B: [0]PRODI [1]CODE [2]NAME [3]CLASS [4]SKS [5]CAPACITY [6]DAY TIME [7]ROOM

    if (columns.length >= 7) {
      let code = "";
      let name = "";
      let sks = 0;
      let className = "";
      let capacity: number | undefined = undefined;
      let scheduleStr = "";
      let room = "";

      const col3IsNumeric = !isNaN(parseInt(columns[3]));
      const col4IsNumeric = !isNaN(parseInt(columns[4]));
      const col3MatchesClass = /^SI-[A-Z0-9]+$/.test(columns[3] || "");

      if (col3IsNumeric) {
        // Format A
        debug.formatA++;
        code = columns[1]?.trim();
        name = columns[2]?.trim();
        sks = parseInt(columns[3]) || 0;
        className = columns[4]?.trim();
        scheduleStr = columns[6]?.trim();
        room = columns[7]?.trim() || "";
      } else if (col4IsNumeric && col3MatchesClass) {
        // Format B
        debug.formatB++;
        code = columns[1]?.trim();
        name = columns[2]?.trim();
        className = columns[3]?.trim();
        sks = parseInt(columns[4]) || 0;
        capacity = parseInt(columns[5]) || undefined;
        scheduleStr = columns[6]?.trim();
        room = columns[7]?.trim() || "";
      } else {
        // Try to find a line that looks like a main record even if it doesn't match the strict schema
        if (columns[1] && /^\d+$/.test(columns[1])) {
          debug.unknown++;
          // Fallback to Format A if it looks like a code
          code = columns[1].trim();
          name = columns[2]?.trim();
          sks = parseInt(columns[3]) || 0;
          className = columns[4]?.trim();
          scheduleStr = columns[6]?.trim();
          room = columns[7]?.trim() || "";
        } else {
          // Might be a lecturer line handled below
        }
      }

      if (code && name) {
        try {
          // console.log(`Found subject: ${code} ${name}`);
          const subjectId = `${code}-${name}`;
          if (!subjectsMap[subjectId]) {
            subjectsMap[subjectId] = {
              subjectId,
              code,
              name,
              sks,
              classes: [],
            };
          }

          const scheduleParts = (scheduleStr || "").split(" ");
          let day = scheduleParts[0] || "";
          // Simple normalization for Indonesian days
          const dayMap: Record<string, string> = {
            "Senin": "Monday",
            "Selasa": "Tuesday",
            "Rabu": "Wednesday",
            "Kamis": "Thursday",
            "Jumat": "Friday",
            "Sabtu": "Saturday",
            "Minggu": "Sunday"
          };
          // If the engine expects Indonesian or we need to normalize to English:
          // day = dayMap[day] || day; 

          const timeRange = scheduleParts[1] || "";
          const timeParts = timeRange.split("-");
          const startRaw = timeParts[0] || "";
          const endRaw = timeParts[1] || "";

          const meeting: MeetingRaw = {
            day,
            start: normalizeTime(startRaw),
            end: normalizeTime(endRaw),
            room,
          };

          const classId = `${subjectId}-${className}`;
          let existingClass = subjectsMap[subjectId].classes.find(c => c.classId === classId);

          if (!existingClass) {
            existingClass = {
              classId,
              className,
              meetings: [meeting],
              lecturers: [],
              capacity,
            };
            subjectsMap[subjectId].classes.push(existingClass);
          } else {
            existingClass.meetings.push(meeting);
          }
          currentClass = existingClass;
          continue;
        } catch (err: any) {
          console.error(`Error processing subject ${code}-${name} on line ${i}:`, err.message);
          throw err;
        }
      }
    }

    // Handle lecturer lines or potential multi-line names
    if (currentClass) {
      debug.lecturerLines++;
      const lecturer = line.trim();
      if (lecturer && !currentClass.lecturers.includes(lecturer) && !lecturer.startsWith("SISTEM INFORMASI")) {
        currentClass.lecturers.push(lecturer);
      }
    }
  }

  return {
    subjects: Object.values(subjectsMap),
    debug
  };
}

export function checkMeetingConflict(m1: MeetingRaw, m2: MeetingRaw): boolean {
  try {
    const s1 = Schedule.buildFromString(`${m1.day} ${m1.start}-${m1.end}`);
    const s2 = Schedule.buildFromString(`${m2.day} ${m2.start}-${m2.end}`);
    return s1.isOverlap(s2);
  } catch (e) {
    console.warn("Invalid schedule format for overlap check:", m1, m2);
    return false;
  }
}

export function checkClassConflict(c1: ClassScheduleRaw, c2: ClassScheduleRaw): boolean {
  for (const m1 of c1.meetings) {
    for (const m2 of c2.meetings) {
      if (checkMeetingConflict(m1, m2)) return true;
    }
  }
  return false;
}

export * from "./rules";
export * from "./generator";
