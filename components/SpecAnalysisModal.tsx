import React from 'react';
import { X, ShieldCheck, AlertTriangle, Info, AlertCircle, CheckCircle, Bug, Download } from 'lucide-react';
import { AnalysisReport, AnalysisIssue } from '../services/geminiService';

interface SpecAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AnalysisReport | null;
  loading: boolean;
}

export const SpecAnalysisModal: React.FC<SpecAnalysisModalProps> = ({ isOpen, onClose, report, loading }) => {
  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500';
    if (score >= 70) return 'text-amber-400 border-amber-500';
    return 'text-rose-400 border-rose-500';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'info': return <Info className="w-4 h-4 text-sky-400" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      security: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
      correctness: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      design: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      performance: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    };
    return (
      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${colors[category] || 'bg-slate-800 text-slate-400'}`}>
        {category}
      </span>
    );
  };

  const handleDownloadPdf = () => {
    if (!report) return;

    // Access jsPDF from window global (assuming loaded via CDN like jsyaml)
    const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
    
    if (!jsPDF) {
        console.error("jsPDF library not loaded");
        return;
    }

    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal?.pageSize?.width || 210;
    const maxWidth = pageWidth - (margin * 2);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Spec Analysis Report", margin, y);
    y += 15;

    // Meta
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, y);
    y += 10;
    doc.text(`Health Score: ${report.score}/100`, margin, y);
    y += 15;
    doc.setTextColor(0);

    // Summary
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", margin, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(report.summary, maxWidth);
    doc.text(summaryLines, margin, y);
    y += (summaryLines.length * 6) + 10;

    // Issues
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Issues", margin, y);
    y += 10;

    report.issues.forEach((issue) => {
        // Page break check
        if (y > 260) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        
        // Header line
        const header = `[${issue.severity.toUpperCase()}] ${issue.category.toUpperCase()}`;
        doc.text(header, margin, y);
        
        // Location
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        const locWidth = doc.getTextWidth(header);
        doc.text(` - ${issue.location || 'Global'}`, margin + locWidth, y);
        doc.setTextColor(0);
        y += 6;

        // Message
        const messageLines = doc.splitTextToSize(issue.message, maxWidth);
        doc.text(messageLines, margin, y);
        y += (messageLines.length * 5) + 3;

        // Suggestion
        if (issue.suggestion) {
            doc.setTextColor(80);
            doc.setFont("courier", "normal");
            const fixPrefix = "Fix: ";
            const fixLines = doc.splitTextToSize(fixPrefix + issue.suggestion, maxWidth);
            doc.text(fixLines, margin, y);
            y += (fixLines.length * 4);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0);
        }

        y += 8; // Spacer
    });

    doc.save(`analysis-report-${Date.now()}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500/10 p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-sky-400" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-100">Spec Analysis Report</h2>
                <p className="text-xs text-slate-400">Automated audit for bugs, security, and best practices.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative bg-slate-950/50 flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
              <div className="relative">
                 <div className="w-16 h-16 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
                 <Bug className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-600" />
              </div>
              <p className="text-sm font-medium animate-pulse">Auditing specification...</p>
            </div>
          ) : report ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Score Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                        <div className={`absolute inset-0 opacity-10 ${report.score >= 70 ? 'bg-gradient-to-br from-emerald-500 to-transparent' : 'bg-gradient-to-br from-rose-500 to-transparent'}`} />
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Health Score</span>
                        <div className={`text-5xl font-bold mb-2 ${getScoreColor(report.score).split(' ')[0]}`}>
                            {report.score}
                        </div>
                        <div className="text-xs text-slate-500">out of 100</div>
                    </div>
                    <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-center shadow-lg">
                        <h3 className="text-sm font-bold text-slate-200 mb-2">Executive Summary</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {report.summary}
                        </p>
                        <div className="flex gap-4 mt-4 pt-4 border-t border-slate-800/50">
                            <div className="flex items-center gap-2 text-xs text-rose-400">
                                <AlertCircle className="w-4 h-4" />
                                <span className="font-bold">{report.issues.filter(i => i.severity === 'critical').length}</span> Critical
                            </div>
                            <div className="flex items-center gap-2 text-xs text-amber-400">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="font-bold">{report.issues.filter(i => i.severity === 'warning').length}</span> Warnings
                            </div>
                            <div className="flex items-center gap-2 text-xs text-sky-400">
                                <Info className="w-4 h-4" />
                                <span className="font-bold">{report.issues.filter(i => i.severity === 'info').length}</span> Suggestions
                            </div>
                        </div>
                    </div>
                </div>

                {/* Issues List */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                        <Bug className="w-4 h-4" /> Detected Issues
                    </h3>
                    
                    {report.issues.length === 0 && (
                        <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col items-center text-center">
                            <CheckCircle className="w-12 h-12 text-emerald-500/50 mb-3" />
                            <p className="text-slate-300 font-medium">No issues detected!</p>
                            <p className="text-xs text-slate-500 mt-1">Your spec appears to be in perfect health.</p>
                        </div>
                    )}

                    {report.issues.map((issue, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex gap-4 hover:border-slate-700 transition-colors group">
                            <div className="shrink-0 mt-1">
                                {getSeverityIcon(issue.severity)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    {getCategoryBadge(issue.category)}
                                    <span className="text-xs font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 truncate max-w-[200px]" title={issue.location}>
                                        {issue.location || 'Global'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-200 font-medium mb-1">
                                    {issue.message}
                                </p>
                                <div className="text-xs text-slate-500 flex items-start gap-1.5 bg-slate-950/50 p-2 rounded border border-slate-800/50">
                                    <span className="text-indigo-400 font-semibold shrink-0">Fix:</span>
                                    {issue.suggestion}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-600">
                <p>Ready to analyze.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
             {report && (
                <button 
                    onClick={handleDownloadPdf}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 border border-slate-700"
                >
                    <Download className="w-4 h-4" /> Download PDF
                </button>
            )}
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
                Close Report
            </button>
        </div>
      </div>
    </div>
  );
};
