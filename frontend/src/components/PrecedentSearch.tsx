import React, { useState } from 'react';
import { Search, Database, ShieldAlert, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { PrecedentSearchResponse, GroundedCitationSource } from '../types/legal';

export const PrecedentSearch: React.FC = () => {
  const [query, setQuery] = useState('Implied warranty of habitability tenant repair remedies');
  const [jurisdiction, setJurisdiction] = useState('California');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PrecedentSearchResponse | null>(null);

  // Shepardizing / Citation Checker State
  const [citationCheck, setCitationCheck] = useState('Chevron U.S.A. v. NRDC, 467 U.S. 837 (1984)');
  const [verifying, setVerifying] = useState(false);
  const [citationResult, setCitationResult] = useState<GroundedCitationSource | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.searchPrecedents(query, jurisdiction);
      setResults(res);
    } catch (err) {
      console.error('Error during precedent vector search:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyCitation(citationCheck);
      setCitationResult(res);
    } catch (err) {
      console.error('Error verifying citation:', err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-950 to-purple-900 text-white rounded-xl p-6 shadow-sm flex justify-between items-center">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-purple-800 text-purple-200 text-xs font-semibold mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>Vertex AI Vector Search • text-embedding-004 (768 Dim)</span>
          </div>
          <h1 className="text-2xl font-bold google-sans">Precedent Retrieval & Shepardizing RAG</h1>
          <p className="text-purple-200 text-sm">
            Approximate nearest neighbor semantic retrieval across state and federal statutory corpora.
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <span className="text-xs text-purple-300 block">Vector Index</span>
          <span className="font-mono text-sm font-semibold text-white">legal-statutes-vector-index-001</span>
        </div>
      </div>

      {/* Semantic Vector Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search legal doctrines, statutory code, or precedent holdings..."
                className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-purple-600 focus:border-purple-600"
              />
            </div>
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="text-sm p-3 border border-gray-300 rounded-lg focus:ring-purple-600 focus:border-purple-600 bg-gray-50"
            >
              <option value="California">California</option>
              <option value="Federal">Federal</option>
              <option value="New York">New York</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-700 text-white rounded-lg font-medium text-sm hover:bg-purple-800 disabled:opacity-50 transition-all shadow-sm flex items-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Semantic Search</span>
                  <Search className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Shepardizing Anti-Hallucination Tool */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-purple-600" />
          <span>Real-Time Shepardizing & Overruled Case Detector (Google Grounding)</span>
        </h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={citationCheck}
            onChange={(e) => setCitationCheck(e.target.value)}
            className="flex-1 text-sm p-2.5 border border-gray-300 rounded-lg"
            placeholder="Enter case citation to test (e.g. 'Roe v. Wade' or 'Lochner v. New York')"
          />
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-black"
          >
            {verifying ? 'Verifying...' : 'Verify Authority'}
          </button>
        </div>

        {citationResult && (
          <div
            className={`p-4 rounded-lg border text-xs space-y-1 ${
              citationResult.verified_authority
                ? 'bg-green-50 border-green-200 text-green-900'
                : 'bg-red-50 border-red-300 text-red-900'
            }`}
          >
            <div className="flex items-center space-x-2 font-bold text-sm">
              {citationResult.verified_authority ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Verified Binding Authority (Good Law)</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>CRITICAL WARNING: Superceded / Overruled Precedent</span>
                </>
              )}
            </div>
            <p className="leading-relaxed">{citationResult.snippet}</p>
          </div>
        )}
      </div>

      {/* Vector Search Results List */}
      {results && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-gray-500 px-1">
            <span>Found {results.total_results} nearest neighbors in Vertex AI Vector Search</span>
            <span className="font-mono">Latency: {results.execution_time_ms.toFixed(1)}ms</span>
          </div>

          <div className="space-y-3">
            {results.citations.map((c, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-2 hover:border-purple-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-gray-900">{c.citation}</span>
                    <span className="text-xs text-gray-500">({c.jurisdiction})</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-800">
                    Similarity: {(c.relevance_score * 100).toFixed(1)}%
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-gray-700">{c.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed font-mono bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {c.snippet}
                </p>
                {c.source_url && (
                  <div className="pt-1 flex justify-end">
                    <a
                      href={c.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-purple-700 hover:underline inline-flex items-center space-x-1 font-semibold"
                    >
                      <span>Read Statute / Holding</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
