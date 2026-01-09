"use client";

import { useState } from "react";
import { Clock, MapPin, Maximize2, Minimize2, ZoomIn, AlertTriangle, Zap, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Meeting } from "@/lib/store";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 07:00 - 19:00

interface ScheduleGridProps {
    selectedClasses: any[];
    conflicts: Record<string, boolean>;
    compact?: boolean;
}

export function ScheduleGrid({ selectedClasses, conflicts, compact = false }: ScheduleGridProps) {
    const [rowHeight, setRowHeight] = useState(compact ? 70 : 120);
    const totalHeight = HOURS.length * rowHeight;

    const getPosition = (meeting: Meeting) => {
        const dayIndex = DAYS.indexOf(meeting.day);
        if (dayIndex === -1) return null;

        const [startH, startM] = meeting.start.split(":").map(Number);
        const [endH, endM] = meeting.end.split(":").map(Number);

        const startInMinutes = startH * 60 + startM;
        const endInMinutes = endH * 60 + endM;

        const gridStartInMinutes = 7 * 60;
        const top = ((startInMinutes - gridStartInMinutes) / 60) * rowHeight;
        const height = ((endInMinutes - startInMinutes) / 60) * rowHeight;

        return { dayIndex, top, height };
    };

    return (
        <div className={cn(
            "flex-1 bg-background flex flex-col h-full relative group/grid selection:bg-none select-none transition-colors",
            compact ? "rounded-xl overflow-hidden" : "rounded-none"
        )}>
            {/* Zoom Controls Overlay */}
            {!compact && (
                <div className="absolute top-6 right-6 z-50 flex flex-col gap-2 transition-soft sm:opacity-0 sm:group-hover/grid:opacity-100">
                    {[
                        { h: 70, icon: Minimize2, label: "Compact" },
                        { h: 120, icon: Maximize2, label: "Default" },
                        { h: 180, icon: ZoomIn, label: "Expanded" }
                    ].map(btn => (
                        <button
                            key={btn.h}
                            onClick={() => setRowHeight(btn.h)}
                            className={cn(
                                "p-2.5 rounded-lg border transition-soft realistic-shadow flex items-center justify-center",
                                rowHeight === btn.h
                                    ? "bg-primary border-primary text-primary-foreground scale-105"
                                    : "bg-background border-border text-muted-foreground/40 hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <btn.icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>
            )}

            {/* Header Days - Sticky */}
            <div className="flex bg-card shrink-0 z-40 border-b border-border shadow-sm transition-colors">
                <div className={cn("w-16 border-r border-border flex items-center justify-center p-4", compact && "w-12 p-2")}>
                    <Zap className="w-3.5 h-3.5 text-primary/40" fill="currentColor" />
                </div>
                {DAYS.map(day => (
                    <div key={day} className={cn(
                        "flex-1 p-4 text-center transition-colors border-r last:border-r-0 border-border bg-card",
                        compact && "p-2 font-black text-muted-foreground/20 text-[9px] uppercase tracking-widest"
                    )}>
                        {!compact && (
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{day}</span>
                        )}
                        {compact && day.substring(0, 3)}
                    </div>
                ))}
            </div>

            {/* Grid Area */}
            <div className="flex-1 relative overflow-y-auto no-scrollbar">
                <div
                    className="relative flex"
                    style={{ height: `${totalHeight}px`, minWidth: "100%" }}
                >
                    {/* Time Column */}
                    <div className={cn("w-16 bg-muted/20 border-r border-border shrink-0 h-full transition-colors", compact && "w-12")}>
                        {HOURS.map(hour => (
                            <div key={hour} style={{ height: `${rowHeight}px` }} className="border-b border-border/30 p-2 text-right pr-3 group/hour relative">
                                <span className="text-[10px] font-black text-muted-foreground/30 transition-soft group-hover/hour:text-primary leading-none">{hour.toString().padStart(2, '0')}:00</span>
                            </div>
                        ))}
                    </div>

                    {/* Columns & Lines */}
                    {DAYS.map((day) => (
                        <div key={day} className="flex-1 relative border-r last:border-r-0 border-border/30 h-full">
                            {HOURS.map(hour => (
                                <div key={hour} style={{ height: `${rowHeight}px` }} className="border-b border-border/30" />
                            ))}
                        </div>
                    ))}

                    {/* Overlays */}
                    <div
                        className="absolute inset-0 pointer-events-none transition-soft"
                        style={{ left: compact ? "48px" : "64px" }}
                    >
                        <div className="relative h-full flex">
                            {DAYS.map((day) => (
                                <div key={day} className="flex-1 relative">
                                    {selectedClasses.map(cls => {
                                        if (!cls) return null;
                                        return (cls.meetings || [])
                                            .filter((m: Meeting) => m.day === day)
                                            .map((m: Meeting, mIdx: number) => {
                                                const pos = getPosition(m);
                                                if (!pos) return null;
                                                const isConflicting = conflicts[cls.classId];

                                                return (
                                                    <div
                                                        key={`${cls.classId}-${mIdx}`}
                                                        className={cn(
                                                            "absolute left-[2px] right-[2px] rounded-lg border transition-soft overflow-hidden flex flex-col pointer-events-auto group/block realistic-shadow",
                                                            isConflicting
                                                                ? "bg-destructive/10 border-destructive shadow-lg shadow-destructive/5 z-20"
                                                                : "bg-card border-border hover:border-primary/50 hover:bg-muted/50 z-10 hover:z-30 hover:-translate-y-0.5",
                                                            compact ? "p-2" : "p-4"
                                                        )}
                                                        style={{ top: `${pos.top + 2}px`, height: `${pos.height - 4}px` }}
                                                    >
                                                        {/* Simple color indicator strip */}
                                                        {!isConflicting && (
                                                            <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 group-hover/block:bg-primary transition-colors" />
                                                        )}
                                                        {isConflicting && (
                                                            <div className="absolute top-0 left-0 right-0 h-1 bg-destructive" />
                                                        )}

                                                        <div className="flex-1 min-w-0 space-y-0.5 mt-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className={cn("font-black tracking-[0.1em] opacity-40 uppercase truncate", compact ? "text-[7px]" : "text-[9px]")}>
                                                                    {cls.subjectCode}
                                                                </span>
                                                                {isConflicting && <AlertTriangle className={cn("animate-pulse text-destructive", compact ? "w-2.5 h-2.5" : "w-3.5 h-3.5")} />}
                                                            </div>
                                                            <h4 className={cn("font-bold leading-none truncate transition-soft text-foreground", compact ? "text-[10px]" : "text-[13px]")}>
                                                                {cls.subjectName}
                                                            </h4>
                                                        </div>

                                                        <div className="mt-auto space-y-1">
                                                            <div className="flex items-center justify-between gap-2 overflow-hidden">
                                                                <span className={cn("font-bold text-muted-foreground/60 uppercase", compact ? "text-[8px]" : "text-[10px]")}>Section {cls.className}</span>
                                                                <div className="flex items-center gap-1 opacity-40 group-hover/block:opacity-100 transition-soft overflow-hidden">
                                                                    <MapPin className={cn("shrink-0", compact ? "w-2.5 h-2.5" : "w-3 h-3")} />
                                                                    <span className={cn("font-bold truncate max-w-[60px]", compact ? "text-[8px]" : "text-[10px]")}>{m.room}</span>
                                                                </div>
                                                            </div>
                                                            {!compact && rowHeight > 100 && (
                                                                <div className="flex flex-col gap-1 pt-2 border-t border-border/50 animate-in fade-in duration-300">
                                                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground/30">
                                                                        <User className="w-2.5 h-2.5" />
                                                                        <span className="truncate">{cls.lecturers?.join(" / ")}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground/30">
                                                                        <Clock className="w-2.5 h-2.5" />
                                                                        <span>{m.start}—{m.end}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
