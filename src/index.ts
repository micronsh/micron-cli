import 'dotenv/config';
import { Command } from 'commander';
import { ChatCommand } from './commands/chat.js';
import { DeployCommand } from './commands/deploy.js';
import { CreateCommand } from './commands/create.js';
import { ListCommand } from './commands/list.js';
import { ScanCommand } from './commands/scan.js';
import { RiskCommand } from './commands/risk.js';
import { CompareCommand } from './commands/compare.js';
import { HoldersCommand } from './commands/holders.js';

const program = new Command();

program
  .name('micron')
  .description('Micron CLI - AI Agent Interface')
  .version('1.0.0');

program
  .command('chat')
  .description('Start chatting with an AI agent')
  .action(async () => {
    const chatCommand = new ChatCommand();
    await chatCommand.start();
  });

program
  .command('deploy')
  .description('Deploy agents to blockchain')
  .action(async () => {
    const deployCommand = new DeployCommand();
    await deployCommand.execute();
  });

program
  .command('create')
  .description('Create a new agent locally')
  .action(async () => {
    const createCommand = new CreateCommand();
    await createCommand.execute();
  });

program
  .command('list')
  .description('List all deployed agents')
  .action(async () => {
    const listCommand = new ListCommand();
    await listCommand.execute();
  });

program
  .command('scan')
  .description('Quick security scan of contract/token')
  .argument('<address>', 'Token/contract address')
  .action(async (address) => {
    const command = new ScanCommand();
    await command.execute(address);
  });

program
  .command('risk')
  .description('Generate risk report')
  .argument('<address>', 'Token/contract address')
  .action(async (address) => {
    const command = new RiskCommand();
    await command.execute(address);
  });

program
  .command('compare')
  .description('Compare two tokens or contracts')
  .argument('<address1>', 'First token address')
  .argument('<address2>', 'Second token address')
  .action(async (address1, address2) => {
    const command = new CompareCommand();
    await command.execute(address1, address2);
  });

program
  .command('holders')
  .description('Analyze token holder distribution')
  .argument('<address>', 'Token address')
  .action(async (address) => {
    const command = new HoldersCommand();
    await command.execute(address);
  });

// Default command
if (process.argv.length === 2) {
  process.argv.push('chat');
}

program.parse(); 