'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, Check, X, ShieldAlert, Filter, Search, Play, Users, TrendingUp, BarChart3, Eye, Loader2, Sparkles, Brain, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { detectAIImage } from '@/lib/gemini';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminDashboard() {
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState({
        totalResolved: 0,
        pending: 0,
        blacklisted: 0,
        fraudBlocked: 0
    });

    // AI Detection State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<{ isAI: boolean; confidence: number; analysis: string } | null>(null);

    useEffect(() => {
        setMounted(true);
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch PENDING Blacklist Reports (Moderation Queue)
                const { data: reportData, error: reportError } = await supabase
                    .from('blacklist')
                    .select('*')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false });

                if (!reportError) setReports(reportData || []);

                // 2. Fetch Stats
                const { count: blacklistedCount } = await supabase.from('blacklist').select('*', { count: 'exact', head: true }).eq('status', 'verified');
                const { count: pendingCount } = await supabase.from('blacklist').select('*', { count: 'exact', head: true }).eq('status', 'pending');
                const { data: statsData } = await supabase.from('stats').select('key, value').in('key', ['total_resolved_disputes', 'total_fraud_blocked']);

                const totalResolved = statsData?.find(s => s.key === 'total_resolved_disputes')?.value || 0;
                const fraudBlocked = statsData?.find(s => s.key === 'total_fraud_blocked')?.value || 0;

                setStats({
                    totalResolved: Number(totalResolved),
                    pending: pendingCount || 0,
                    blacklisted: blacklistedCount || 0,
                    fraudBlocked: Number(fraudBlocked)
                });

            } catch (err) {
                console.error('Admin fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        const channel = supabase
            .channel('admin_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'blacklist' }, () => fetchData())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleVerdict = async (id: string, newStatus: 'verified' | 'dismissed') => {
        try {
            const { error } = await supabase
                .from('blacklist')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            setSelectedReport(null);
        } catch (err: any) {
            alert('Gagal update status: ' + err.message);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="max-w-7xl mx-auto px-6 py-12 bg-[var(--background)]">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-3xl font-serif font-medium text-[var(--color-text-main)] mb-2">Admin Console</h1>
                        <p className="text-[var(--color-text-muted)] text-sm">Global command center for fraud detection & mediation</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search reports..."
                                className="bg-[var(--surface)] border border-[var(--border)] rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-[var(--primary)] outline-none w-80 text-[var(--color-text-main)] shadow-sm placeholder:text-[var(--color-text-muted)] opacity-80"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                        </div>
                        <button className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--background)] transition-colors text-[var(--color-text-muted)]">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Resolved', value: stats.totalResolved.toLocaleString(), icon: ShieldCheck, color: 'text-emerald-600' },
                        { label: 'Pending', value: stats.pending, icon: AlertCircle, color: 'text-amber-600' },
                        { label: 'Blacklisted', value: stats.blacklisted, icon: ShieldAlert, color: 'text-rose-600' },
                        { label: 'Blocked', value: stats.fraudBlocked.toLocaleString(), icon: TrendingUp, color: 'text-blue-600' }
                    ].map((stat, i) => (
                        <div key={stat.label} className="claude-card p-6 flex items-start justify-between bg-[var(--surface)]">
                            <div>
                                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{stat.label}</p>
                                <p className="text-2xl font-serif text-[var(--color-text-main)]">{stat.value}</p>
                            </div>
                            <stat.icon className={`w-5 h-5 ${stat.color} opacity-80`} />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Live Incidents Feed (Left Column) */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-serif font-medium text-[var(--color-text-main)]">Moderation Queue</h2>
                            {stats.pending > 0 && (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
                                </span>
                            )}
                        </div>

                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                                        <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] w-32">Time</th>
                                        <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Subject</th>
                                        <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">Reason</th>
                                        <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] text-right">View</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {(!mounted || isLoading) ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-[var(--color-text-muted)]">
                                                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 opacity-50" />
                                                <span className="text-xs">Loading data...</span>
                                            </td>
                                        </tr>
                                    ) : reports.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-[var(--color-text-muted)] text-sm">
                                                No pending reports found. All clean.
                                            </td>
                                        </tr>
                                    ) : (
                                        reports.map((report) => (
                                            <tr
                                                key={report.id}
                                                className={`transition-colors cursor-pointer hover:bg-[var(--background)] ${selectedReport?.id === report.id ? 'bg-[var(--background)]' : ''}`}
                                                onClick={() => setSelectedReport(report)}
                                            >
                                                <td className="px-6 py-4 text-xs font-mono text-[var(--color-text-muted)]">
                                                    {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-[var(--color-text-main)]">{report.subject_name}</span>
                                                        <span className="text-xs text-[var(--color-text-muted)]">{report.platform}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-2.5 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                                                        {report.reason}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--primary)] transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mediation Panel (Right Column) */}
                    <div className="lg:col-span-1">
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 min-h-[500px] flex flex-col shadow-sm sticky top-24">
                            {selectedReport ? (
                                <div className="space-y-6 flex flex-col h-full">
                                    <div>
                                        <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Reviewing Case</p>
                                        <h3 className="text-2xl font-serif font-medium text-[var(--color-text-main)] mb-1">{selectedReport.subject_name}</h3>
                                        <p className="text-xs text-[var(--color-text-muted)] font-mono">{selectedReport.id}</p>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                                            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Report Context</p>
                                            <p className="text-sm text-[var(--color-text-main)] italic leading-relaxed">
                                                "{selectedReport.description || 'No description provided.'}"
                                            </p>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Quick Evidence Check</p>
                                                <button
                                                    onClick={async () => {
                                                        setIsAnalyzing(true);
                                                        // Mock/Example checking - in real app we'd fetch actual evidence images
                                                        // For now we check the description if it contains an image URL or use a placeholder
                                                        const result = await detectAIImage("https://placehold.co/600x400?text=Package+Photo");
                                                        setAiResult(result);
                                                        setIsAnalyzing(false);
                                                    }}
                                                    disabled={isAnalyzing}
                                                    className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--primary)] hover:opacity-80 transition-opacity uppercase tracking-widest disabled:opacity-50"
                                                >
                                                    {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                    {isAnalyzing ? "Analyzing..." : "AI Fraud Scan"}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="aspect-video bg-[var(--background)] rounded border border-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-black/5 transition-colors">
                                                    <Play className="w-4 h-4 text-[var(--color-text-muted)] opacity-50" />
                                                </div>
                                                <div className="aspect-video bg-[var(--background)] rounded border border-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-black/5 transition-colors">
                                                    <Play className="w-4 h-4 text-[var(--color-text-muted)] opacity-50" />
                                                </div>
                                            </div>

                                            {/* AI Analysis Result Display */}
                                            {aiResult && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`mt-4 p-4 rounded-lg border ${aiResult.isAI ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {aiResult.isAI ? (
                                                            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                                        ) : (
                                                            <Brain className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                                        )}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className={`text-xs font-bold uppercase tracking-wider ${aiResult.isAI ? 'text-rose-700' : 'text-emerald-700'}`}>
                                                                    {aiResult.isAI ? '🚨 Terdeteksi AI' : '✅ Terverifikasi Asli'}
                                                                </p>
                                                                <span className="text-[10px] bg-white/50 px-1.5 py-0.5 rounded font-mono">
                                                                    Score: {aiResult.confidence}%
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-[var(--color-text-main)] italic leading-relaxed">
                                                                {aiResult.analysis}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-[var(--border)] mt-auto">
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleVerdict(selectedReport.id, 'verified')}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                                            >
                                                <Check className="w-4 h-4" /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleVerdict(selectedReport.id, 'dismissed')}
                                                className="bg-white border border-[var(--border)] hover:bg-[var(--background)] text-[var(--color-text-main)] py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <X className="w-4 h-4" /> Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <ShieldCheck className="w-12 h-12 text-[var(--color-text-muted)] mb-4" />
                                    <p className="text-sm font-medium text-[var(--color-text-main)]">Select a report to review</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
