import { Rule, Day } from "./types";

export interface ValidationError {
    ruleId?: string;
    path: string;
    message: string;
}

export function validateRules(rules: Rule[]): { ok: boolean; rules: Rule[]; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const validDays: Day[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

    rules.forEach((rule, index) => {
        if (!rule.id) {
            errors.push({ path: `rules[${index}].id`, message: "id is required" });
        }
        if (typeof rule.enabled !== "boolean") {
            errors.push({ ruleId: rule.id, path: `rules[${index}].enabled`, message: "enabled must be a boolean" });
        }

        switch (rule.type) {
            case "timeWindow":
                if (rule.scope === "day" && !rule.day) {
                    errors.push({ ruleId: rule.id, path: `rules[${index}].day`, message: "day is required when scope is 'day'" });
                }
                if (rule.earliestStartMin !== undefined) {
                    if (!Number.isInteger(rule.earliestStartMin) || rule.earliestStartMin < 0 || rule.earliestStartMin > 1440) {
                        errors.push({ ruleId: rule.id, path: `rules[${index}].earliestStartMin`, message: "must be an integer between 0 and 1440" });
                    }
                }
                if (rule.latestEndMin !== undefined) {
                    if (!Number.isInteger(rule.latestEndMin) || rule.latestEndMin < 0 || rule.latestEndMin > 1440) {
                        errors.push({ ruleId: rule.id, path: `rules[${index}].latestEndMin`, message: "must be an integer between 0 and 1440" });
                    }
                }
                if (rule.earliestStartMin !== undefined && rule.latestEndMin !== undefined && rule.earliestStartMin >= rule.latestEndMin) {
                    errors.push({ ruleId: rule.id, path: `rules[${index}]`, message: "earliestStartMin must be less than latestEndMin" });
                }
                break;

            case "noDay":
                if (!Array.isArray(rule.days) || rule.days.length === 0) {
                    errors.push({ ruleId: rule.id, path: `rules[${index}].days`, message: "days must be a non-empty array" });
                } else {
                    rule.days.forEach((d, dIdx) => {
                        if (!validDays.includes(d)) {
                            errors.push({ ruleId: rule.id, path: `rules[${index}].days[${dIdx}]`, message: "invalid day" });
                        }
                    });
                }
                break;

            case "maxGap":
                if (!Number.isInteger(rule.maxGapMin) || rule.maxGapMin < 0 || rule.maxGapMin > 1440) {
                    errors.push({ ruleId: rule.id, path: `rules[${index}].maxGapMin`, message: "must be an integer between 0 and 1440" });
                }
                break;

            case "maxDaysPerWeek":
                if (!Number.isInteger(rule.maxDays) || rule.maxDays < 1 || rule.maxDays > 7) {
                    errors.push({ ruleId: rule.id, path: `rules[${index}].maxDays`, message: "must be an integer between 1 and 7" });
                }
                break;

            case "compactDays":
                if (!Number.isInteger(rule.maxDistinctDays) || rule.maxDistinctDays < 1 || rule.maxDistinctDays > 7) {
                    errors.push({ ruleId: rule.id, path: `rules[${index}].maxDistinctDays`, message: "must be an integer between 1 and 7" });
                }
                break;
        }
    });

    return { ok: errors.length === 0, rules, errors };
}
