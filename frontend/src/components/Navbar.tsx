import React from 'react';
import { Scale, ShieldCheck, Sparkles, Database } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'copilot', label: 'Gemini Legal Copilot', icon: Sparkles },
    { id: 'contracts', label: 'Contract Risk Heatmap', icon: Scale },
    { id: 'triage', label: 'Equal Access Triage', icon: ShieldCheck },
    { id: 'search', label: 'Precedent Search (RAG)', icon: Database },
    { id: 'metrics', label: 'BigQuery Analytics', icon: Database },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg text-google-blue">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-[#202124] google-sans">Justitia<span className="text-google-blue">AI</span></span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  Google Vertex AI
                </span>
              </div>
              <p className="text-xs text-gray-500">Legal Intelligence & Equal Access Platform</p>
            </div>
          </div>

          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-google-blue border-b-2 border-google-blue'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-google-blue' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              <span className="w-1.5 h-1.5 mr-1.5 bg-green-500 rounded-full animate-pulse"></span>
              ABA 5.5 Guard Active
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
