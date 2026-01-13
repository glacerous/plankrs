import { Rule, RuleContext, ScheduleVariant, Day } from "./types";
import { buildRuleContext } from "./context";

export interface EvaluationResult {
    ok: boolean;
    message?: string;
    fails: string[];
}

export function evaluateRule(rule: Rule, ctx: RuleContext): { pass: boolean; message?: string } {
    if (!rule.enabled) return { pass: true };

    switch (rule.type) {
        case "noDay": {
            for (const day of rule.days) {
                if (ctx.byDay[day].blocks.length > 0) {
                    return { pass: false, message: `Has activity on banned day: ${day}` };
                }
            }
            return { pass: true };
        }

        case "timeWindow": {
            const checkRange = (day: Day) => {
                for (const block of ctx.byDay[day].blocks) {
                    if (rule.earliestStartMin !== undefined && block.startMin < rule.earliestStartMin) {
                        return { pass: false, message: `Activity starts before ${rule.earliestStartMin} min on ${day}` };
                    }
                    if (rule.latestEndMin !== undefined && block.endMin > rule.latestEndMin) {
                        return { pass: false, message: `Activity ends after ${rule.latestEndMin} min on ${day}` };
                    }
                }
                return { pass: true };
            };

            if (rule.scope === "allDays") {
                for (const day of Object.keys(ctx.byDay) as Day[]) {
                    const res = checkRange(day);
                    if (!res.pass) return res;
                }
            } else if (rule.day) {
                return checkRange(rule.day);
            }
            return { pass: true };
        }

        case "noGaps": {
            const daysToCheck = rule.days || (Object.keys(ctx.byDay) as Day[]);
            for (const day of daysToCheck) {
                const blocks = ctx.byDay[day].blocks;
                for (let i = 0; i < blocks.length - 1; i++) {
                    if (blocks[i + 1].startMin > blocks[i].endMin) {
                        return { pass: false, message: `Gap detected on ${day}` };
                    }
                }
            }
            return { pass: true };
        }

        case "maxGap": {
            const daysToCheck = rule.days || (Object.keys(ctx.byDay) as Day[]);
            for (const day of daysToCheck) {
                const blocks = ctx.byDay[day].blocks;
                for (let i = 0; i < blocks.length - 1; i++) {
                    if (blocks[i + 1].startMin - blocks[i].endMin > rule.maxGapMin) {
                        return { pass: false, message: `Gap exceeds ${rule.maxGapMin} min on ${day}` };
                    }
                }
            }
            return { pass: true };
        }

        case "maxDaysPerWeek": {
            if (ctx.distinctDays > rule.maxDays) {
                return { pass: false, message: `Distinct days (${ctx.distinctDays}) exceed ${rule.maxDays}` };
            }
            return { pass: true };
        }

        case "compactDays": {
            if (ctx.distinctDays > rule.maxDistinctDays) {
                return { pass: false, message: `Distinct days (${ctx.distinctDays}) exceed ${rule.maxDistinctDays}` };
            }
            return { pass: true };
        }

        default:
            return { pass: true };
    }
}

export function evaluateAllRules(rules: Rule[], variant: ScheduleVariant): EvaluationResult {
    const ctx = buildRuleContext(variant);
    const fails: string[] = [];

    for (const rule of rules) {
        const res = evaluateRule(rule, ctx);
        if (!res.pass) {
            fails.push(rule.id);
        }
    }

    return {
        ok: fails.length === 0,
        fails,
    };
}
