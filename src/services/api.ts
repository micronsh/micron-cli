import type { Agent, TokenData } from '../types/index.js';
import { AgentCapability } from '../types/index.js';
import { StorageService } from './storage.js';

interface TokenAnalysisResponse {
  tokenData: {
    indicatorData: {
      high: { count: number; details: string };
      moderate: { count: number; details: string };
      low: { count: number; details: string };
      specific: { count: number; details: string };
    };
    tokenOverview: {
      deployer: string;
      mint: string;
      address: string;
      type: string;
    };
    address: string;
    tokenName: string;
    deployTime: string;
    externals: string;
    liquidityList: Array<{
      raydium?: {
        address: string;
        amount: number;
        lpPair: string;
      };
    }>;
    marketCap: number;
    ownersList: Array<{
      address: string;
      amount: string;
      percentage: string;
    }>;
    score: number;
    tokenImg: string;
    tokenSymbol: string;
    auditRisk: {
      mintDisabled: boolean;
      freezeDisabled: boolean;
      lpBurned: boolean;
      top10Holders: boolean;
    };
  };
  tokenInfo: {
    price: string;
    supplyAmount: number;
    mktCap: number;
  };
}

interface AgentsResponse {
  data: Agent[];
}

export class APIService {
  private baseUrl: string;
  private storage: StorageService;

  constructor(baseUrl: string = process.env.API_URL || 'https://api.micron.sh') {
    this.baseUrl = baseUrl;
    this.storage = new StorageService();
  }

  async fetchAgents(): Promise<Agent[]> {
    try {
      const localAgents = await this.storage.loadAgents();
      const response = await fetch(`${this.baseUrl}/v1/agents`);
      if (!response.ok) throw new Error('Failed to fetch remote agents');
      
      const { data: remoteAgents } = await response.json() as AgentsResponse;
      return [...localAgents, ...remoteAgents];
    } catch (error) {
      console.error('Error fetching agents:', error);
      return this.storage.loadAgents();
    }
  }

  async getTokenAnalysis(address: string): Promise<TokenData> {
    const response = await fetch(`${this.baseUrl}/v1/token/${address}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch token data: ${response.statusText}`);
    }
    return response.json() as Promise<TokenData>;
  }
} 