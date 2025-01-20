import OpenAI from 'openai';
import type { ChatMessage, TokenData } from '../types/index.js';
import { APIService } from './api.js';

const FUNCTIONS = [
  {
    name: 'analyzeToken',
    description: 'Fetch and analyze token data from a given address',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The token contract address'
        }
      },
      required: ['address']
    }
  }
];

export class OpenAIService {
  private client: OpenAI;
  private tokenData: Map<string, TokenData> = new Map();
  private apiService: APIService;
  private systemPrompt: string;

  constructor(apiKey: string = process.env.OPENAI_API_KEY!, systemPrompt: string) {
    this.client = new OpenAI({ apiKey });
    this.apiService = new APIService();
    this.systemPrompt = systemPrompt;
  }

  private async handleAnalyzeToken(address: string): Promise<TokenData> {
    if (this.tokenData.has(address)) {
      return this.tokenData.get(address)!;
    }

    const tokenData = await this.apiService.getTokenAnalysis(address);
    this.tokenData.set(address, tokenData);
    return tokenData;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const completion = await this.client.chat.completions.create({
      messages: [
        { role: 'system', content: this.systemPrompt },
        ...messages.map(m => {
          if (m.role === 'function') {
            return { role: m.role, content: m.content, name: m.name! };
          }
          return { role: m.role, content: m.content };
        })
      ],
      model: 'gpt-3.5-turbo',
      functions: FUNCTIONS as any[],
      function_call: 'auto'
    });

    const response = completion.choices[0].message;

    if (response.function_call) {
      const functionName = response.function_call.name;
      const args = JSON.parse(response.function_call.arguments);

      if (functionName === 'analyzeToken') {
        const tokenData = await this.handleAnalyzeToken(args.address);
        // Add function result to messages
        messages.push({
          role: 'function',
          content: JSON.stringify(tokenData),
          name: functionName
        });
        // Get AI's interpretation of the data
        return this.chat(messages);
      }
    }

    return response.content || '';
  }
} 