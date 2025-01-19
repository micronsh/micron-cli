export enum AgentCapability {
  TOKEN_ANALYSIS = 'TOKEN_ANALYSIS'
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  systemPrompt: string;
  mintAddress?: string;
  imagePath?: string;
  initialSolAmount?: string;
}

export interface TokenData {
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

export interface ChatMessage {
  role: 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
} 