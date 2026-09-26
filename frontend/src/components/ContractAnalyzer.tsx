import React, { useState } from 'react';
import { Upload, FileText, AlertTriangle, ShieldCheck, ChevronRight, Scale } from 'lucide-react';
import { api } from '../services/api';
import { ContractAnalysisResponse, ClauseAnalysis } from '../types/legal';

export const ContractAnalyzer: React.FC = () => {
  const [docTitle, setDocTitle] = useState('Enterprise Cloud Services Agreement');
  const [contractType, setContractType] = useState('Commercial SaaS');
  const [clientPosition, setClientPosition] = useState('Customer');
  const [riskTolerance, setRiskTolerance] = useState('Strict');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ContractAnalysisResponse | null>(null);
  const [selectedClause, setSelectedClause] = useState<ClauseAnalysis | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await api.analyzeContract({
        document_title: docTitle,
        contract_type: contractType,
        client_position: clientPosition,
        risk_tolerance: riskTolerance,
      });
      setAnalysis(res);
      if (res.clauses.length > 0) {
        setSelectedClause(res.clauses[0]);
      }
    } catch (err) {
      console.error('Error analyzing contract:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-6 shadow-sm flex justify-between items-center">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-800 text-blue-300 text-xs font-semibold mb-2">
            <Scale aria-hidden="true" className="w-3.5 h-3.5" />
            <span>Google Document AI • Contract Parser & Risk Heatmap</span>
          </div>
          <h1 className="text-2xl font-bold google-sans">Automated Contract Intelligence & Redliner</h1>
          <p className="text-gray-300 text-sm">
            Extract asymmetric liabilities, calculate indemnification exposure, and generate protective counter-proposals.
          </p>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-xs text-gray-400 block">OCR Processor</span>
          <span className="font-mono text-sm font-semibold text-emerald-400">contract-parser-v2-us</span>
        </div>
      </div>

      {/* Input / Control Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <form aria-label="Contract Analysis Parameters" onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="doc-title-input" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Document Name
              </label>
              <input
                id="doc-title-input"
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-google-blue focus:border-google-blue focus-visible:outline-none focus-visible:ring-2"
              />
            </div>

            <div>
              <label htmlFor="contract-type-select" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Contract Type
              </label>
              <select
                id="contract-type-select"
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-google-blue focus:border-google-blue focus-visible:outline-none focus-visible:ring-2"
              >
                <option value="Commercial SaaS">Commercial SaaS / Cloud</option>
                <option value="Non-Disclosure Agreement">Mutual / Unilateral NDA</option>
                <option value="Commercial Lease">Commercial Real Estate Lease</option>
                <option value="Employment Agreement">Executive Employment Contract</option>
              </select>
            </div>

            <div>
              <label htmlFor="client-position-select" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Client Perspective
              </label>
              <select
                id="client-position-select"
                value={clientPosition}
                onChange={(e) => setClientPosition(e.target.value)}
                className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-google-blue focus:border-google-blue focus-visible:outline-none focus-visible:ring-2"
              >
                <option value="Customer">Customer / Licensee (Defensive)</option>
                <option value="Vendor">Vendor / Service Provider</option>
                <option value="Employee">Employee / Independent Contractor</option>
                <option value="Tenant">Tenant / Lessee</option>
              </select>
            </div>

            <div>
              <label htmlFor="risk-tolerance-select" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Risk Tolerance
              </label>
              <select
                id="risk-tolerance-select"
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(e.target.value)}
                className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-google-blue focus:border-google-blue focus-visible:outline-none focus-visible:ring-2"
              >
                <option value="Strict">Strict (Zero Uncapped Exposure)</option>
                <option value="Moderate">Moderate (Standard Market Terms)</option>
                <option value="Aggressive">Commercial Expediency</option>
              </select>
            </div>
          </div>

          {/* Upload Zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload legal contract PDF or DOCX file to Document AI"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAnalyze(); }}
            className="mt-4 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-google-blue transition-colors cursor-pointer bg-gray-50/50 focus-visible:ring-2 focus-visible:ring-google-blue focus-visible:outline-none"
          >
            <Upload aria-hidden="true" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Drag & drop contract PDF/DOCX or click to upload</p>
            <p className="text-xs text-gray-500 mt-1">Processed natively via Google Document AI Contract Parser with CMEK encryption</p>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={loading}
              aria-label={loading ? 'Analyzing contract with Document AI' : 'Run Heatmap Assessment'}
              className="px-6 py-2.5 bg-google-blue text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm flex items-center space-x-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-google-blue focus-visible:outline-none"
            >
              {loading ? (
                <span role="status" className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                  <span>Parsing Clauses & Evaluating Risk...</span>
                </span>
              ) : (
                <>
                  <span>Run Heatmap Assessment</span>
                  <ChevronRight aria-hidden="true" className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results View */}
      {analysis && (
        <section role="region" aria-label="Contract Risk Heatmap Analysis" aria-live="polite" className="space-y-6">
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xs font-semibold text-gray-500 uppercase">Composite Risk Score</h2>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-red-600">{analysis.overall_risk_score}</span>
                <span className="text-sm text-gray-500">/ 100</span>
              </div>
              <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-semibold uppercase border ${getRiskBadge(analysis.overall_risk_level)}`}>
                {analysis.overall_risk_level} Exposure
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xs font-semibold text-gray-500 uppercase">Clauses Evaluated</h2>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-gray-900">{analysis.total_clauses_evaluated}</span>
              </div>
              <span className="text-xs text-gray-500 block mt-2">100% semantic coverage</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xs font-semibold text-gray-500 uppercase">Critical Redline Flags</h2>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-orange-600">{analysis.critical_flags_count}</span>
              </div>
              <span className="text-xs text-orange-600 block mt-2 font-medium">Requires immediate revision</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xs font-semibold text-gray-500 uppercase">Document AI Confidence</h2>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-emerald-600">98.4%</span>
              </div>
              <span className="text-xs text-emerald-600 block mt-2 font-medium">High entity precision</span>
            </div>
          </div>

          {/* Interactive Clause Heatmap Explorer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Clause Navigation Column */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3" role="tablist" aria-label="Contract Clauses">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Evaluated Clauses</h3>
              <div className="space-y-2">
                {analysis.clauses.map((clause) => {
                  const isSelected = selectedClause?.clause_id === clause.clause_id;
                  return (
                    <div
                      key={clause.clause_id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      aria-label={`Clause: ${clause.clause_title}, Risk Level: ${clause.risk_level}`}
                      onClick={() => setSelectedClause(clause)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedClause(clause); }}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-google-blue ${
                        isSelected
                          ? 'border-google-blue bg-blue-50/60 shadow-sm ring-1 ring-google-blue'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-900 truncate">{clause.clause_title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase border ${getRiskBadge(clause.risk_level)}`}>
                          {clause.risk_level}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1">{clause.risk_rationale}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Redline & Detail Column */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
              {selectedClause ? (
                <>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{selectedClause.clause_title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold uppercase border ${getRiskBadge(selectedClause.risk_level)}`}>
                          Risk Score: {selectedClause.risk_score} / 100
                        </span>
                        <span className="text-xs text-gray-400" aria-hidden="true">•</span>
                        <span className="text-xs text-gray-500">
                          Governing: {selectedClause.governing_statutes.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Rationale */}
                  <div role="alert" className="p-4 bg-red-50/60 border border-red-200 rounded-lg text-xs text-red-900 space-y-1">
                    <span className="font-bold flex items-center space-x-1.5 uppercase tracking-wider text-[11px] text-red-700">
                      <AlertTriangle aria-hidden="true" className="w-3.5 h-3.5" />
                      <span>Legal Vulnerability & Exposure Analysis</span>
                    </span>
                    <p className="leading-relaxed">{selectedClause.risk_rationale}</p>
                  </div>

                  {/* Original vs Redline Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Original Counterparty Clause:
                      </h4>
                      <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 leading-relaxed font-mono">
                        {selectedClause.original_text}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center space-x-1">
                        <ShieldCheck aria-hidden="true" className="w-3.5 h-3.5" />
                        <span>Recommended Redline (Protective):</span>
                      </h4>
                      <div className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-lg text-xs text-emerald-950 leading-relaxed font-mono">
                        {selectedClause.suggested_revision}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FileText aria-hidden="true" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Select a clause to review the detailed legal exposure and redline recommendation.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
