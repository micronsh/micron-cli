import fs from 'fs/promises';
import type { Agent } from '../types/index.js';

export class StorageService {
  private readonly agentsPath = 'data/agents.json';

  constructor() {
    // Ensure data directory exists
    fs.mkdir('data').catch(() => {});
  }

  async loadAgents(): Promise<Agent[]> {
    try {
      const data = await fs.readFile(this.agentsPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async saveAgent(agent: Agent): Promise<void> {
    const agents = await this.loadAgents();
    agents.push(agent);
    await fs.writeFile(this.agentsPath, JSON.stringify(agents, null, 2));
  }

  async updateAgent(updatedAgent: Agent): Promise<void> {
    const agents = await this.loadAgents();
    const index = agents.findIndex(a => a.id === updatedAgent.id);
    
    if (index === -1) {
      throw new Error(`Agent ${updatedAgent.id} not found`);
    }
    
    agents[index] = updatedAgent;
    await fs.writeFile(this.agentsPath, JSON.stringify(agents, null, 2));
  }
} 