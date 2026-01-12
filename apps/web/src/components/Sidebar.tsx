"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Database, CalendarDays, Zap, ShieldCheck, Sun, Moon } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Sidebar() {
    const pathname = usePathname();
    const activePlanId = useAppStore((state) => state.activePlanId);
    const plans = useAppStore((state) => state.plans);
    const activePlan = plans.find(p => p.id === activePlanId);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Datasources", href: "/datasource", icon: Database },
        { name: "Master Schedule", href: "/view", icon: CalendarDays, disabled: !activePlanId },
    ];

    return (
        <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0 z-50 overflow-hidden transition-colors">
            <div className="p-6 border-b border-border/50">
                <Link href="/" className="flex items-center gap-2.5 group">

                    <span className="text-[13px] font-black tracking-widest text-foreground">
                        KRS<span className="text-muted-foreground font-medium">lab</span>
                    </span>
                </Link>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1">
                <div className="mb-4 px-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Navigation</p>
                </div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                    if (item.disabled) {
                        return (
                            <div
                                key={item.name}
                                className="flex items-center gap-3 px-3 py-2.5 text-muted-foreground/30 cursor-not-allowed select-none transition-soft"
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-[13px] font-medium">{item.name}</span>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-soft font-medium text-[13px] relative group",
                                isActive
                                    ? "text-primary bg-primary/5"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <Icon className={cn("w-4 h-4 transition-soft", isActive ? "text-primary" : "group-hover:text-foreground")} />
                            {item.name}
                            {isActive && (
                                <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 space-y-4">
                {activePlan && (
                    <div className="p-4 bg-muted/50 border border-border/50 rounded-xl space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider italic">Active Plan</p>
                        </div>
                        <p className="text-[13px] font-bold text-foreground truncate">{activePlan.name}</p>
                        <Link
                            href={`/plan/${activePlanId}`}
                            className="bg-primary text-primary-foreground text-[11px] font-black py-2 rounded-lg flex items-center justify-center gap-1 transition-soft hover:bg-primary/90 active:scale-95 shadow-sm"
                        >
                            MODIFY
                        </Link>
                    </div>
                )}

                <div className="flex items-center justify-between px-2 pt-2 border-t border-border/50">
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-soft active:scale-95"
                        aria-label="Toggle Theme"
                    >
                        {mounted && (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />)}
                    </button>
                    <div className="flex items-center gap-1.5 text-muted-foreground/40">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">V1.0</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
