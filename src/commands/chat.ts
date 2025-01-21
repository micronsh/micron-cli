import inquirer from 'inquirer';
import { APIService } from '../services/api.js';
import { OpenAIService } from '../services/openai.js';
import type { Agent, ChatMessage } from '../types/index.js';

export class ChatCommand {
  private apiService: APIService;
  private openAIService: OpenAIService | null = null;
  private messages: ChatMessage[] = [];

  constructor() {
    this.apiService = new APIService();
  }

  async start() {
    try {
      const agents = await this.apiService.fetchAgents();
      const selectedAgent = await this.selectAgent(agents);
      const systemPrompt = (selectedAgent as any).systemPrompt || '';
      this.openAIService = new OpenAIService(process.env.OPENAI_API_KEY!, systemPrompt);
      await this.startChat(selectedAgent);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  }

  private async selectAgent(agents: Agent[]): Promise<Agent> {
    const { agentId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'agentId',
        message: 'Select an agent to chat with:',
        choices: agents.map(agent => ({
          name: `${agent.name} - ${agent.description}`,
          value: agent.id
        }))
      }
    ]);

    return agents.find(a => a.id === agentId)!;
  }

  private async startChat(agent: Agent) {
    if (!this.openAIService) {
      throw new Error('OpenAI service not initialized');
    }

    console.log(`Starting chat with ${agent.name}...\n`);
    
    while (true) {
      const { message } = await inquirer.prompt<{ message: string }>({
        type: 'input',
        name: 'message',
        message: 'You:'
      });

      if (message.toLowerCase() === 'exit') break;

      this.messages.push({ role: 'user', content: message });
      const response = await this.openAIService.chat(this.messages);
      this.messages.push({ role: 'assistant', content: response });
      
      console.log(`\n${agent.name}: ${response}\n`);
    }
  }
} 