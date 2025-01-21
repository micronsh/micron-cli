import inquirer from 'inquirer';
import { StorageService } from '../services/storage.js';
import type { Agent } from '../types/index.js';
import { AgentCapability } from '../types/index.js';

export class CreateCommand {
  private storage: StorageService;

  constructor() {
    this.storage = new StorageService();
  }

  async execute() {
    const agent = await this.promptAgentDetails();
    await this.storage.saveAgent(agent);
    console.log('\nAgent created successfully!');
  }

  private async promptAgentDetails(): Promise<Agent> {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'id',
        message: 'Agent ID:',
      },
      {
        type: 'input',
        name: 'name',
        message: 'Agent Name:',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Agent Description:',
      },
      {
        type: 'checkbox',
        name: 'capabilities',
        message: 'Select capabilities:',
        choices: [
          {
            name: 'Token Analysis',
            value: AgentCapability.TOKEN_ANALYSIS
          }
        ]
      }
    ]);

    return answers as Agent;
  }
} 