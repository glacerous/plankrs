"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Clock, CalendarX, Layers, Zap, CheckCircle2, AlertCircle, Dna } from "lucide-react";
import { cn } from "@/lib/utils";
import { Rule, TimeWindowRule, NoDayRule, MaxDaysPerWeekRule, MaxGapRule, Day } from "@krs/engine";
import { createPortal } from "react-dom";

interface RulesLabProps {
    isOpen: boolean;
    onClose: () => void;
    rules: Rule[];
    onUpdateRules: (rules: Rule[]) => void;
    onGenerate: () => void;
}

const DAYS: Day[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function RulesLab({ isOpen, onClose, rules, onUpdateRules, onGenerate }: RulesLabProps) {
    const toggleRule = (id: string) => {
        const newRules = rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
        onUpdateRules(newRules);
    };

    const removeRule = (id: string) => {
        const newRules = rules.filter(r => r.id !== id);
        onUpdateRules(newRules);
    };

    const updateRuleData = (id: string, data: Partial<Rule>) => {
        const newRules = rules.map(r => r.id === id ? { ...r, ...data } as Rule : r);
        onUpdateRules(newRules);
    };

    // Handle ESC to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleEsc);
        }
        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, [isOpen, onClose]);

    const addRule = (type: Rule["type"]) => {
        const id = crypto.randomUUID();
        let newRule: Rule;

        switch (type) {
            case "noDay":
                newRule = { id, type: "noDay", enabled: true, days: [], label: "No Day" };
                break;
            case "timeWindow":
                newRule = { id, type: "timeWindow", enabled: true, scope: "allDays", earliestStartMin: 480, latestEndMin: 1080, label: "Time Window" };
                break;
            case "maxDaysPerWeek":
                newRule = { id, type: "maxDaysPerWeek", enabled: true, maxDays: 4, label: "Max Days" };
                break;
            case "maxGap":
                newRule = { id, type: "maxGap", enabled: true, maxGapMin: 60, label: "Max Gap" };
                break;
            default:
                return;
        }

        onUpdateRules([...rules, newRule]);
    };

    return (
        <>
            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[100] animate-in fade-in duration-300 pointer-events-none"
                >
                    <div className="absolute inset-0 bg-black/5 transition-opacity pointer-events-none" />

                    {/* Panel */}
                    <div
                        className="absolute top-0 right-0 h-full w-[400px] max-w-[90vw] bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 z-[110] pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-primary" /> Rules
                                </h2>
                                <p className="text-[10px] text-muted-foreground mt-1 font-medium opacity-60">CONFIGURE GENERATOR CONSTRAINTS</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-full transition-soft text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Rules List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {rules.length === 0 ? (
                                <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl opacity-40">
                                    <Layers className="w-8 h-8 mb-2" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">No active rules</p>
                                </div>
                            ) : (
                                rules.map((rule) => (
                                    <RuleCard
                                        key={rule.id}
                                        rule={rule}
                                        onToggle={() => toggleRule(rule.id)}
                                        onRemove={() => removeRule(rule.id)}
                                        onUpdate={(data) => updateRuleData(rule.id, data)}
                                    />
                                ))
                            )}

                            {/* Add Rules Section */}
                            <div className="pt-4 border-t border-border">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3 opacity-50">Add New Constraint</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <AddRuleButton label="No Day" icon={CalendarX} onClick={() => addRule("noDay")} />
                                    <AddRuleButton label="Time Window" icon={Clock} onClick={() => addRule("timeWindow")} />
                                    <AddRuleButton label="Max Days" icon={Layers} onClick={() => addRule("maxDaysPerWeek")} />
                                    <AddRuleButton label="Max Gap" icon={Zap} onClick={() => addRule("maxGap")} />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border bg-muted/20 shrink-0">
                            <button
                                onClick={onGenerate}
                                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-[0.15em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                <Dna className="w-4 h-4" /> Run Generation
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

function AddRuleButton({ label, icon: Icon, onClick }: { label: string, icon: any, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-border/50 bg-muted/40 hover:bg-primary/5 hover:border-primary/20 transition-soft group"
        >
            <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </button>
    );
}

function RuleCard({ rule, onToggle, onRemove, onUpdate }: {
    rule: Rule,
    onToggle: () => void,
    onRemove: () => void,
    onUpdate: (data: Partial<Rule>) => void
}) {
    const isValid = () => {
        if (!rule.enabled) return true;
        if (rule.type === "noDay") return rule.days.length > 0;
        if (rule.type === "timeWindow") {
            const start = rule.earliestStartMin ?? 0;
            const end = rule.latestEndMin ?? 1440;
            return start < end;
        }
        return true;
    };

    return (
        <div className={cn(
            "rounded-xl border transition-soft realistic-shadow",
            rule.enabled ? "bg-card border-border shadow-sm" : "bg-muted/30 border-border/50 opacity-60"
        )}>
            {/* Card Header */}
            <div className="p-4 flex items-center justify-between border-b border-border/10">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-lg",
                        rule.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                        {rule.type === "noDay" && <CalendarX className="w-3.5 h-3.5" />}
                        {rule.type === "timeWindow" && <Clock className="w-3.5 h-3.5" />}
                        {rule.type === "maxDaysPerWeek" && <Layers className="w-3.5 h-3.5" />}
                        {rule.type === "maxGap" && <Zap className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                        <h3 className="text-[11px] font-black uppercase tracking-wider">{rule.label}</h3>
                        {!isValid() && (
                            <span className="text-[8px] text-destructive font-bold flex items-center gap-1 mt-0.5">
                                <AlertCircle className="w-2.5 h-2.5" /> Incomplete
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Switch checked={rule.enabled} onChange={onToggle} />
                    <button
                        onClick={onRemove}
                        className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-soft text-muted-foreground/40"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Card Content */}
            {rule.enabled && (
                <div className="p-4 animate-in slide-in-from-top-1 duration-200">
                    {rule.type === "noDay" && (
                        <NoDayPicker
                            selectedDays={rule.days}
                            onChange={(days) => onUpdate({ days })}
                        />
                    )}
                    {rule.type === "timeWindow" && (
                        <TimeWindowPicker
                            earliestMin={rule.earliestStartMin}
                            latestMin={rule.latestEndMin}
                            onChange={(start, end) => onUpdate({ earliestStartMin: start, latestEndMin: end })}
                        />
                    )}
                    {rule.type === "maxDaysPerWeek" && (
                        <NumberInput
                            value={rule.maxDays}
                            min={1}
                            max={6}
                            label="Max Days per Week"
                            onChange={(val) => onUpdate({ maxDays: val })}
                        />
                    )}
                    {rule.type === "maxGap" && (
                        <NumberInput
                            value={rule.maxGapMin}
                            min={15}
                            max={480}
                            step={15}
                            label="Max Gap (Minutes)"
                            unit="min"
                            onChange={(val) => onUpdate({ maxGapMin: val })}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function Switch({ checked, onChange }: { checked: boolean, onChange: () => void }) {
    return (
        <button
            onClick={onChange}
            className={cn(
                "w-8 h-4.5 rounded-full p-1 transition-soft",
                checked ? "bg-primary" : "bg-muted-foreground/30"
            )}
        >
            <div className={cn(
                "w-2.5 h-2.5 bg-white rounded-full transition-transform",
                checked ? "translate-x-3.5" : "translate-x-0"
            )} />
        </button>
    );
}

function NoDayPicker({ selectedDays, onChange }: { selectedDays: Day[], onChange: (days: Day[]) => void }) {
    const toggleDay = (day: Day) => {
        if (selectedDays.includes(day)) {
            onChange(selectedDays.filter(d => d !== day));
        } else {
            onChange([...selectedDays, day]);
        }
    };

    return (
        <div className="space-y-2">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1.5">Exclude Days</p>
            <div className="flex flex-wrap gap-1.5">
                {DAYS.map((day) => (
                    <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-soft",
                            selectedDays.includes(day)
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-muted border-border text-muted-foreground hover:border-muted-foreground/20"
                        )}
                    >
                        {day}
                    </button>
                ))}
            </div>
        </div>
    );
}

function TimeWindowPicker({ earliestMin, latestMin, onChange }: {
    earliestMin?: number,
    latestMin?: number,
    onChange: (start: number, end: number) => void
}) {
    const formatTime = (min?: number) => {
        if (min === undefined) return "";
        const h = Math.floor(min / 60);
        const m = min % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const handleTimeChange = (type: 'start' | 'end', val: string) => {
        const [h, m] = val.split(':').map(Number);
        const total = h * 60 + m;
        if (type === 'start') onChange(total, latestMin ?? 1080);
        else onChange(earliestMin ?? 480, total);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Earliest Start</p>
                    <input
                        type="time"
                        value={formatTime(earliestMin)}
                        onChange={(e) => handleTimeChange('start', e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-lg p-2 text-[11px] font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-soft"
                    />
                </div>
                <div className="space-y-1.5">
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Latest End</p>
                    <input
                        type="time"
                        value={formatTime(latestMin)}
                        onChange={(e) => handleTimeChange('end', e.target.value)}
                        className="w-full bg-muted/30 border border-border rounded-lg p-2 text-[11px] font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-soft"
                    />
                </div>
            </div>
        </div>
    );
}

function NumberInput({ value, min, max, label, unit, step = 1, onChange }: {
    value: number,
    min: number,
    max: number,
    label: string,
    unit?: string,
    step?: number,
    onChange: (val: number) => void
}) {
    return (
        <div className="space-y-2">
            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{label}</p>
            <div className="flex items-center gap-3">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="flex-1 accent-primary h-1 bg-muted rounded-full cursor-pointer"
                />
                <span className="text-[11px] font-black bg-muted px-2.5 py-1 rounded-md min-w-[3rem] text-center">
                    {value}{unit}
                </span>
            </div>
        </div>
    );
}
