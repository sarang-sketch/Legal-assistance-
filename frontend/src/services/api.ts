import axios from 'axios';
import {
  ContractAnalysisResponse,
  LegalAssistantQueryResponse,
  ProBonoTriageResponse,
  PrecedentSearchResponse,
  BigQueryMetricsSummary,
  GroundedCitationSource,
} from '../types/legal';

const API_BASE = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  async queryAssistant(params: {
    prompt: string;
    jurisdiction?: string;
    enable_grounding?: boolean;
    temperature?: number;
  }): Promise<LegalAssistantQueryResponse> {
    const res = await apiClient.post<LegalAssistantQueryResponse>('/assistant/query', {
      prompt: params.prompt,
      jurisdiction: params.jurisdiction || 'Federal',
      enable_grounding: params.enable_grounding ?? true,
      temperature: params.temperature ?? 0.2,
    });
    return res.data;
  },

  async simplifyLegalese(legalText: string, targetLanguage: string = 'en') {
    const res = await apiClient.post('/assistant/simplify', {
      legal_text: legalText,
      target_language: targetLanguage,
      reading_level: '8th_grade',
    });
    return res.data;
  },

  async analyzeContract(params: {
    document_title: string;
    contract_type: string;
    client_position: string;
    risk_tolerance: string;
    raw_text?: string;
  }): Promise<ContractAnalysisResponse> {
    const res = await apiClient.post<ContractAnalysisResponse>('/contracts/analyze', params);
    return res.data;
  },

  async uploadAndParseContract(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/contracts/upload-parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async evaluateTriage(data: {
    annual_income: number;
    household_size: number;
    state_or_zip: string;
    legal_issue_description: string;
    has_court_summons: boolean;
    hearing_date?: string;
    preferred_language?: string;
  }): Promise<ProBonoTriageResponse> {
    const res = await apiClient.post<ProBonoTriageResponse>('/triage/evaluate', data);
    return res.data;
  },

  async searchPrecedents(query: string, jurisdiction?: string): Promise<PrecedentSearchResponse> {
    const res = await apiClient.post<PrecedentSearchResponse>('/search/precedents', {
      query,
      jurisdiction: jurisdiction || 'Federal',
      max_results: 5,
    });
    return res.data;
  },

  async verifyCitation(citation: string): Promise<GroundedCitationSource> {
    const res = await apiClient.post<GroundedCitationSource>('/search/verify-citation', null, {
      params: { citation },
    });
    return res.data;
  },

  async getMetrics(): Promise<BigQueryMetricsSummary> {
    const res = await apiClient.get<BigQueryMetricsSummary>('/audit/metrics');
    return res.data;
  },
};
