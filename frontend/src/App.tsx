import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LegalAssistantChat } from './components/LegalAssistantChat';
import { ContractAnalyzer } from './components/ContractAnalyzer';
import { ProBonoTriagePortal } from './components/ProBonoTriagePortal';
import { PrecedentSearch } from './components/PrecedentSearch';
import { MetricsDashboard } from './components/MetricsDashboard';
import { ShieldAlert } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('copilot');

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      {/* WCAG 2.1 AA Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-google-blue focus:font-semibold focus:shadow-md focus:rounded-md focus:outline-none focus:ring-2 focus:ring-google-blue"
      >
        Skip to main content
      </a>

      <div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main id="main-content" role="main" tabIndex={-1} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none">
          {activeTab === 'copilot' && <LegalAssistantChat />}
          {activeTab === 'contracts' && <ContractAnalyzer />}
          {activeTab === 'triage' && <ProBonoTriagePortal />}
          {activeTab === 'search' && <PrecedentSearch />}
          {activeTab === 'metrics' && <MetricsDashboard />}
        </main>
      </div>

      {/* Global Regulatory & Ethics Footer */}
      <footer role="contentinfo" className="bg-white border-t border-gray-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert aria-hidden="true" className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Regulatory Notice:</strong> JustitiaAI operates strictly as a legal workflow copilot under ABA Model Rule 5.5 and does not constitute attorney representation.
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Powered by Google Cloud (Vertex AI • Document AI • BigQuery • Cloud Run)</span>
            <span>&copy; {new Date().getFullYear()} JustitiaAI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
