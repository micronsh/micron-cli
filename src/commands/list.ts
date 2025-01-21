import { StorageService } from '../services/storage.js';
import chalk from 'chalk';

export class ListCommand {
  private storage: StorageService;

  constructor() {
    this.storage = new StorageService();
  }

  async execute() {
    try {
      const agents = await this.storage.loadAgents();
      const deployedAgents = agents.filter(agent => agent.mintAddress);

      if (deployedAgents.length === 0) {
        console.log(chalk.yellow('No deployed agents found.'));
        return;
      }

      console.log(chalk.bold('\nDeployed Agents:'));
      deployedAgents.forEach(agent => {
        console.log(`
${chalk.green(agent.name)} (${chalk.blue(agent.id)})
${chalk.dim(agent.description)}
${chalk.magenta('Mint:')} ${agent.mintAddress}
${chalk.cyan('Pump.fun:')} https://pump.fun/coin/${agent.mintAddress}
${chalk.dim('─'.repeat(50))}
`);
      });
    } catch (error) {
      console.error(chalk.red('Failed to list agents:', error));
    }
  }
} 