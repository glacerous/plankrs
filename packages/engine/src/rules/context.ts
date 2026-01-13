import { Day, RuleContext, ScheduleVariant, TimeBlock } from "./types";

function timeToMin(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + (m || 0);
}

export function buildRuleContext(variant: ScheduleVariant): RuleContext {
    const byDay: Record<Day, { blocks: TimeBlock[] }> = {
        Senin: { blocks: [] },
        Selasa: { blocks: [] },
        Rabu: { blocks: [] },
        Kamis: { blocks: [] },
        Jumat: { blocks: [] },
        Sabtu: { blocks: [] },
        Minggu: { blocks: [] },
    };

    Object.values(variant.picks).forEach((section) => {
        section.meetings.forEach((meeting) => {
            const day = meeting.day as Day;
            if (byDay[day]) {
                byDay[day].blocks.push({
                    startMin: timeToMin(meeting.start),
                    endMin: timeToMin(meeting.end),
                });
            }
        });
    });

    let distinctDays = 0;
    (Object.keys(byDay) as Day[]).forEach((day) => {
        // Sort blocks by start time
        byDay[day].blocks.sort((a, b) => a.startMin - b.startMin);
        if (byDay[day].blocks.length > 0) {
            distinctDays++;
        }
    });

    return { byDay, distinctDays };
}
