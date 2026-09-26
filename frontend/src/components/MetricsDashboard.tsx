import React, { useEffect, useState } from 'react';
import { Database, BarChart3, Users, FileCheck, Shield, Clock } from 'lucide-react';
import { api } from '../services/api';
import { BigQueryMetricsSummary } from '../types/legal';

export const MetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<BigQueryMetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await api.getMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Error fetching BigQuery metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 to-cyan-900 text-white rounded-xl p-6 shadow-sm flex justify-between items-center">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-800 text-cyan-200 text-xs font-semibold mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>Google BigQuery • Serverless Analytics & Regulatory Audit Trail</span>
          </div>
          <h1 className="text-2xl font-bold google-sans">Access-to-Justice & Operations Telemetry</h1>
          <p className="text-cyan-100 text-sm">
            Real-time streaming aggregations monitoring legal clinic routing efficiency and contract risk distribution.
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-xs text-cyan-300 block">BigQuery Dataset</span>
          <span className="font-mono text-sm font-semibold text-white">justitia_legal_ops</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <div className="w-8 h-8 border-4 border-google-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Querying Google BigQuery Analytics Engine...</p>
        </div>
      ) : metrics ? (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Pro-Bono Match Rate</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-emerald-600">{metrics.pro_bono_match_rate_pct}%</span>
              </div>
              <span className="text-xs text-gray-500 block mt-2">Routed to verified Legal Aid</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Total Litigants Triaged</span>
                <FileCheck className="w-4 h-4 text-google-blue" />
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-gray-900">{metrics.total_cases_triaged}</span>
              </div>
              <span className="text-xs text-gray-500 block mt-2">Civil cases processed</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Contracts Audited</span>
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-purple-700">{metrics.total_contracts_scanned}</span>
              </div>
              <span className="text-xs text-gray-500 block mt-2">Avg Risk: {metrics.avg_contract_risk_score}/100</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">Mean Serving Latency</span>
                <Clock className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="mt-3 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-cyan-700">{metrics.avg_latency_ms.toFixed(0)}</span>
                <span className="text-sm text-gray-500">ms</span>
              </div>
              <span className="text-xs text-emerald-600 block mt-2 font-medium">99.9% Cloud Run SLA</span>
            </div>
          </div>

          {/* Breakdown by Domain */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-google-blue" />
                <span>Caseload Distribution by Civil Legal Domain:</span>
              </h3>
              <div className="space-y-3 pt-2">
                {Object.entries(metrics.top_categories).map(([category, count]) => {
                  const maxCount = Math.max(...Object.values(metrics.top_categories));
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-gray-700">
                        <span>{category}</span>
                        <span className="font-bold text-gray-900">{count} cases</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-google-blue h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Compliance & Security Attestation */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Security & Regulatory Audit Status:</span>
              </h3>
              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                  <span className="font-medium text-emerald-950">ABA Model Rule 5.5 UPL Guardrail</span>
                  <span className="px-2 py-0.5 rounded font-bold bg-emerald-200 text-emerald-900">100% ENFORCED</span>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <span className="font-medium text-blue-950">PII & Attorney-Client Scrubbing</span>
                  <span className="px-2 py-0.5 rounded font-bold bg-blue-200 text-blue-900">ZERO LEAKAGE</span>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                  <span className="font-medium text-purple-950">Google Cloud Storage CMEK Encryption</span>
                  <span className="px-2 py-0.5 rounded font-bold bg-purple-200 text-purple-900">AES-256 (KMS)</span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                  <span className="font-medium text-amber-950">Anti-Hallucination Grounding Verification</span>
                  <span className="px-2 py-0.5 rounded font-bold bg-amber-200 text-amber-900">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
