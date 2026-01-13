export type Day = "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu" | "Minggu";

export type Minute = number; // 0..1440

import type { MeetingRaw as Meeting, ClassScheduleRaw as Section, SubjectRaw as Course } from "../base-types";

export type { Meeting, Section, Course };

export interface ScheduleVariant {
    picks: Record<string, Section>; // courseId -> Section
}

export interface RuleBase {
    id: string;
    enabled: boolean;
    label?: string;
}

export type TimeWindowRule = RuleBase & {
    type: "timeWindow";
    scope: "allDays" | "day";
    day?: Day;
    earliestStartMin?: Minute;
    latestEndMin?: Minute;
};

export type NoDayRule = RuleBase & {
    type: "noDay";
    days: Day[];
};

export type NoGapsRule = RuleBase & {
    type: "noGaps";
    days?: Day[];
};

export type MaxGapRule = RuleBase & {
    type: "maxGap";
    maxGapMin: Minute;
    days?: Day[];
};

export type MaxDaysPerWeekRule = RuleBase & {
    type: "maxDaysPerWeek";
    maxDays: number;
};

export type CompactDaysRule = RuleBase & {
    type: "compactDays";
    maxDistinctDays: number;
};

export type Rule =
    | TimeWindowRule
    | NoDayRule
    | NoGapsRule
    | MaxGapRule
    | MaxDaysPerWeekRule
    | CompactDaysRule;

export interface TimeBlock {
    startMin: Minute;
    endMin: Minute;
}

export interface RuleContext {
    byDay: Record<Day, { blocks: TimeBlock[] }>;
    distinctDays: number;
}
