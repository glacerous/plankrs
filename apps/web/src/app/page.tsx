"use client";

import { useAppStore } from "@/lib/store";
import { Plus, Calendar, Settings2, Trash2, ArrowRight, Zap, FolderDot } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function HomePage() {
    const { plans, activePlanId, setActivePlanId, deletePlan } = useAppStore();

    const handleSetActive = (id: string, name: string) => {
        setActivePlanId(id);
        toast.success("Schedule Activated", { description: `${name} is now the primary plan.` });
    };

    const handleDeletePlan = (e: React.MouseEvent, id: string, name: string) => {
        e.preventDefault();
        e.stopPropagation();
        deletePlan(id);
        toast.error("Plan Deleted", { description: `"${name}" removed from infrastructure.` });
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tight text-foreground">Plans</h1>
                    <p className="text-sm text-muted-foreground font-medium">Manage and optimize your academic blueprints.</p>
                </div>

                <Link
                    href="/plan/create"
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-black text-[12px] uppercase tracking-wider shadow-sm transition-soft hover:bg-primary/90 active:scale-95 group"
                >
                    <Plus className="w-4 h-4 transition-soft group-hover:rotate-90" />
                    New Plan
                </Link>
            </header>

            <section className="space-y-6">
                {plans.length === 0 ? (
                    <div className="py-20 bg-muted/20 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                            <FolderDot className="w-6 h-6 text-muted-foreground/40" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[13px] font-bold text-foreground">No plans detected</h4>
                            <p className="text-xs text-muted-foreground font-medium">Create your first plan to start scheduling.</p>
                        </div>
                        <Link
                            href="/plan/create"
                            className="text-primary font-bold text-[11px] uppercase tracking-widest hover:underline"
                        >
                            Initialize System
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {plans.map((p) => {
                            const isActive = activePlanId === p.id;
                            return (
                                <div
                                    key={p.id}
                                    onClick={() => handleSetActive(p.id, p.name)}
                                    className={cn(
                                        "group relative flex flex-col p-6 rounded-xl border transition-soft cursor-pointer bg-card realistic-shadow hover:translate-y-[-2px] hover:border-primary/30",
                                        isActive ? "border-primary/50 bg-primary/[0.02]" : "border-border"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-8">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center border transition-soft",
                                            isActive
                                                ? "bg-primary border-primary text-primary-foreground shadow-sm"
                                                : "bg-muted border-border text-muted-foreground/50"
                                        )}>
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <button
                                            onClick={(e) => handleDeletePlan(e, p.id, p.name)}
                                            className="p-1.5 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 rounded-md transition-soft md:opacity-0 md:group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-1 mb-6">
                                        <h4 className="text-[15px] font-bold text-foreground truncate group-hover:text-primary transition-soft leading-snug">
                                            {p.name}
                                        </h4>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            {p.selectedSubjectIds.length} Subjects
                                        </p>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between gap-3">
                                        <Link
                                            href={`/plan/${p.id}`}
                                            className="flex-1 flex items-center justify-center gap-2 bg-muted text-muted-foreground py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-soft border border-transparent"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Settings2 className="w-3.5 h-3.5" />
                                            Configure
                                        </Link>
                                    </div>

                                    {isActive && (
                                        <div className="absolute top-4 right-4 flex items-center gap-1.5 animate-in fade-in slide-in-from-right-1 duration-300">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">Active</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
