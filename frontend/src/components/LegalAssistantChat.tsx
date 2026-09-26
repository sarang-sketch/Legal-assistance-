import React, { useState } from 'react';
import { Send, Sparkles, BookOpen, AlertCircle, ArrowRight, Languages, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { LegalAssistantQueryResponse } from '../types/legal';

export const LegalAssistantChat: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [jurisdiction, setJurisdiction] = useState('California');
  const [enableGrounding, setEnableGrounding] = useState(true);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<LegalAssistantQueryResponse | null>(null);
  const [simplifiedText, setSimplifiedText] = useState<string | null>(null);
  const [simplifying, setSimplifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setSimplifiedText(null);
    try {
      const res = await api.queryAssistant({
        prompt,
        jurisdiction,
        enable_grounding: enableGrounding,
      });
      setResponse(res);
    } catch (err) {
      console.error('Error querying assistant:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimplify = async (lang: string = 'en') => {
    if (!response) return;
    setSimplifying(true);
    try {
      const res = await api.simplifyLegalese(response.answer, lang);
      setSimplifiedText(res.simplified_text);
    } catch (err) {
      console.error('Error simplifying text:', err);
    } finally {
      setSimplifying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-blue-700/50 text-blue-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini 1.5 Pro • 1M Context Window • Search Grounded</span>
            </div>
            <h1 className="text-2xl font-bold google-sans">Jurisprudential Research Copilot</h1>
            <p className="text-blue-100 text-sm max-w-2xl">
              Synthesize statutory doctrine, assess procedural thresholds, and verify binding precedent with Google Search Grounding anti-hallucination guardrails.
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-xs text-blue-200 block">Model Engine</span>
            <span className="font-mono text-sm font-semibold text-white">gemini-1.5-pro-002</span>
          </div>
        </div>
      </div>

      {/* Query Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Jurisdiction:</label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-google-blue focus:border-google-blue p-2"
              >
                <option value="California">California (9th Cir. / Cal. Codes)</option>
                <option value="Federal">Federal (U.S. Code & F.R.C.P.)</option>
                <option value="New York">New York (2d Cir. / CPLR)</option>
                <option value="Delaware">Delaware (Chancery Court)</option>
                <option value="Texas">Texas (5th Cir. / Tex. Civ. Prac.)</option>
              </select>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                checked={enableGrounding}
                onChange={(e) => setEnableGrounding(e.target.checked)}
                className="rounded border-gray-300 text-google-blue focus:ring-google-blue"
              />
              <span className="font-medium">Google Search Grounding (Live Dockets)</span>
            </label>
          </div>

          <div>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. What are the affirmative defenses to an unlawful detainer eviction action based on failure to maintain tenantability under California law?"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-google-blue focus:border-transparent text-gray-900 text-sm"
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>Automatic PII & Attorney-Client Privilege Redaction Active</span>
            </div>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-google-blue text-white rounded-lg font-medium text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-google-blue disabled:opacity-50 transition-all shadow-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Reasoning on Vertex AI...</span>
                </>
              ) : (
                <>
                  <span>Analyze Doctrine</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Response Display */}
      {response && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  Confidence: {(response.confidence_score * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-gray-500 font-mono">Latency: {response.latency_ms.toFixed(1)}ms</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSimplify('en')}
                  disabled={simplifying}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-xs font-medium hover:bg-amber-100 transition-colors"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>Simplify (8th Grade Plain Language)</span>
                </button>
                <button
                  onClick={() => handleSimplify('es')}
                  disabled={simplifying}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>Traducir al Español</span>
                </button>
              </div>
            </div>

            {/* Simplified Text Box if generated */}
            {simplifiedText && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg text-sm text-amber-950 space-y-2">
                <div className="font-semibold text-xs tracking-wider text-amber-800 uppercase flex items-center space-x-1.5">
                  <Languages className="w-4 h-4" />
                  <span>Google Cloud Translation • Plain Language Synthesis</span>
                </div>
                <p className="leading-relaxed">{simplifiedText}</p>
              </div>
            )}

            {/* Legal Synthesis */}
            <div className="prose max-w-none text-gray-800 text-sm leading-relaxed whitespace-pre-line">
              {response.answer}
            </div>

            {/* Actionable Next Steps */}
            {response.actionable_next_steps.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Procedural Action Items:</h4>
                <ul className="space-y-1.5">
                  {response.actionable_next_steps.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                      <ArrowRight className="w-4 h-4 text-google-blue shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Grounded Citations */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-google-blue" />
                <span>Grounded Authorities & Binding Precedents:</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {response.grounded_citations.map((c, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-900 truncate">{c.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">
                        {(c.relevance_score * 100).toFixed(0)}% match
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 italic mb-2">"{c.snippet}"</p>
                    {c.uri && (
                      <a
                        href={c.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-google-blue hover:underline inline-flex items-center space-x-1"
                      >
                        <span>View Official Source</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mandatory UPL Disclaimer */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-500 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <span>{response.disclaimer}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
