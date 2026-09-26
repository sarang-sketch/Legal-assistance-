import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, Phone, MapPin, ExternalLink, Calendar, CheckSquare, FileText, HeartHandshake } from 'lucide-react';
import { api } from '../services/api';
import { ProBonoTriageResponse } from '../types/legal';

export const ProBonoTriagePortal: React.FC = () => {
  const [annualIncome, setAnnualIncome] = useState(24000);
  const [householdSize, setHouseholdSize] = useState(3);
  const [stateOrZip, setStateOrZip] = useState('CA');
  const [description, setDescription] = useState(
    'My landlord served me an eviction notice saying I have 3 days to pay or move out, but the heater has been broken all winter and there is black mold in my child\'s bedroom.'
  );
  const [hasSummons, setHasSummons] = useState(true);
  const [hearingDate, setHearingDate] = useState('2026-10-18');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProBonoTriageResponse | null>(null);

  const handleTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.evaluateTriage({
        annual_income: annualIncome,
        household_size: householdSize,
        state_or_zip: stateOrZip,
        legal_issue_description: description,
        has_court_summons: hasSummons,
        hearing_date: hearingDate,
      });
      setResult(res);
    } catch (err) {
      console.error('Error during pro bono triage:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-semibold">
              <HeartHandshake aria-hidden="true" className="w-3.5 h-3.5" />
              <span>Equal Justice Initiative • Free Pro-Bono Legal Aid Triage</span>
            </div>
            <h1 className="text-2xl font-bold google-sans">Access-to-Justice Intake Portal</h1>
            <p className="text-teal-100 text-sm max-w-2xl">
              Evaluate eligibility for free legal aid under federal poverty guidelines, prevent default judgments, and match with authorized non-profit legal clinics.
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-xs text-teal-200 block">Poverty Benchmark</span>
            <span className="font-mono text-sm font-semibold text-white">125% - 200% FPL</span>
          </div>
        </div>
      </div>

      {/* Intake Wizard Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleTriage} aria-label="Legal Aid Eligibility Intake Form" className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="annual-income-input" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Annual Household Income ($)
              </label>
              <input
                id="annual-income-input"
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(Number(e.target.value))}
                className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 focus-visible:outline-none focus-visible:ring-2"
                min="0"
                step="500"
              />
            </div>

            <div>
              <label htmlFor="household-size-input" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Family / Household Size
              </label>
              <input
                id="household-size-input"
                type="number"
                value={householdSize}
                onChange={(e) => setHouseholdSize(Number(e.target.value))}
                className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 focus-visible:outline-none focus-visible:ring-2"
                min="1"
                max="12"
              />
            </div>

            <div>
              <label htmlFor="state-zip-input" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                State / Zip Code
              </label>
              <input
                id="state-zip-input"
                type="text"
                value={stateOrZip}
                onChange={(e) => setStateOrZip(e.target.value)}
                className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 focus-visible:outline-none focus-visible:ring-2"
                placeholder="CA or 94103"
              />
            </div>
          </div>

          <div>
            <label htmlFor="legal-crisis-textarea" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Describe Your Legal Emergency in Plain Words
            </label>
            <textarea
              id="legal-crisis-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 focus-visible:outline-none focus-visible:ring-2"
              placeholder="Tell us what happened..."
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-6">
              <label htmlFor="summons-served-checkbox" className="flex items-center space-x-2 cursor-pointer text-sm text-gray-800 font-medium">
                <input
                  id="summons-served-checkbox"
                  type="checkbox"
                  checked={hasSummons}
                  onChange={(e) => setHasSummons(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 focus-visible:ring-2"
                />
                <span>I received a Court Summons / Notice to Vacate</span>
              </label>

              {hasSummons && (
                <div className="flex items-center space-x-2">
                  <Calendar aria-hidden="true" className="w-4 h-4 text-gray-400" />
                  <label htmlFor="hearing-date-picker" className="text-xs text-gray-500">Court Hearing Date:</label>
                  <input
                    id="hearing-date-picker"
                    type="date"
                    value={hearingDate}
                    onChange={(e) => setHearingDate(e.target.value)}
                    className="text-xs p-1.5 border border-gray-300 rounded-md focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-label={loading ? 'Evaluating poverty guidelines and legal clinics' : 'Evaluate my legal aid eligibility'}
              className="px-6 py-2.5 bg-emerald-700 text-white rounded-lg font-medium text-sm hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-sm flex items-center space-x-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-600 focus-visible:outline-none"
            >
              {loading ? (
                <span role="status" className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                  <span>Evaluating Poverty Guidelines...</span>
                </span>
              ) : (
                <>
                  <span>Evaluate My Legal Aid Eligibility</span>
                  <ShieldCheck aria-hidden="true" className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Triage Results Display */}
      {result && (
        <section role="region" aria-label="Legal Aid Triage Results" aria-live="polite" className="space-y-6">
          {/* Emergency Alert if applicable */}
          {result.statutory_deadline_warning && (
            <div role="alert" className="p-4 bg-red-50 border-l-4 border-red-600 rounded-r-xl flex items-start space-x-3 text-red-900 shadow-sm">
              <AlertCircle aria-hidden="true" className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-red-800">Critical Statutory Deadline Alert</h2>
                <p className="text-xs mt-1 leading-relaxed">{result.statutory_deadline_warning}</p>
              </div>
            </div>
          )}

          {/* Eligibility Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Federal Poverty Guideline</h3>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-emerald-700">{result.poverty_guideline_percentage}%</span>
                <span className="text-sm text-gray-500">of FPL</span>
              </div>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                {result.is_income_eligible ? 'Qualifies for 100% Free Legal Aid' : 'Above Standard Free Threshold'}
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Matter Urgency Tier</h3>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-red-600">{result.urgency_level.replace('_', ' ')}</span>
              </div>
              <span className="text-xs text-gray-500 block mt-2">Active summons priority routing</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Categorized Legal Domain</h3>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-lg font-bold text-gray-900 capitalize">
                  {result.category.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-xs text-gray-500 block mt-2">Specialized clinic matching</span>
            </div>
          </div>

          {/* Self-Help Checklist & Forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2">
                <CheckSquare aria-hidden="true" className="w-4 h-4 text-emerald-600" />
                <span>Pro-Se Tenant Emergency Checklist:</span>
              </h3>
              <ul className="space-y-3">
                {result.self_help_checklist.map((item, i) => (
                  <li key={i} className="flex items-start space-x-2.5 text-xs text-gray-700 leading-relaxed">
                    <span aria-hidden="true" className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-[10px]">
                      {i + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2">
                <FileText aria-hidden="true" className="w-4 h-4 text-blue-600" />
                <span>Required Court Forms to File:</span>
              </h3>
              <div className="space-y-2">
                {result.suggested_court_forms.map((form, i) => (
                  <div key={i} className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800">{form}</span>
                    <button
                      type="button"
                      aria-label={`Download ${form} PDF`}
                      className="text-[10px] text-google-blue font-semibold hover:underline focus-visible:ring-1 focus-visible:ring-google-blue"
                    >
                      Download PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Matched Legal Aid Clinics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Matched Authorized Legal Aid Organizations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.matched_legal_clinics.map((clinic, i) => (
                <div key={i} className="p-4 bg-teal-50/40 border border-teal-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-teal-950">{clinic.organization_name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      Verified LSC Partner
                    </span>
                  </div>
                  <p className="text-xs text-teal-800 font-medium">{clinic.specialty_area}</p>
                  <div className="pt-2 text-xs text-gray-600 space-y-1">
                    <div className="flex items-center space-x-2">
                      <MapPin aria-hidden="true" className="w-3.5 h-3.5 text-gray-400" />
                      <span>{clinic.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone aria-hidden="true" className="w-3.5 h-3.5 text-gray-400" />
                      <a href={`tel:${clinic.phone}`} aria-label={`Call ${clinic.organization_name} at ${clinic.phone}`} className="font-semibold text-gray-800 hover:underline">
                        {clinic.phone}
                      </a>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-between items-center text-xs">
                    <span className="text-gray-500 italic text-[11px]">{clinic.intake_hours}</span>
                    <a
                      href={clinic.website}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Visit intake website for ${clinic.organization_name}`}
                      className="text-emerald-700 font-bold hover:underline inline-flex items-center space-x-1 focus-visible:ring-1 focus-visible:ring-emerald-600"
                    >
                      <span>Direct Intake</span>
                      <ExternalLink aria-hidden="true" className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
