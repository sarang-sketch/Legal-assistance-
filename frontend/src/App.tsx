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
      <div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'copilot' && <LegalAssistantChat />}
          {activeTab === 'contracts' && <ContractAnalyzer />}
          {activeTab === 'triage' && <ProBonoTriagePortal />}
          {activeTab === 'search' && <PrecedentSearch />}
          {activeTab === 'metrics' && <MetricsDashboard />}
        </main>
      </div>

      {/* Global Regulatory & Ethics Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
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
