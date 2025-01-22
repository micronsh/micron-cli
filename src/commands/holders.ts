import { APIService } from '../services/api.js';
import chalk from 'chalk';
import type { TokenData } from '../types/index.js';

export class HoldersCommand {
  private apiService: APIService;

  constructor() {
    this.apiService = new APIService();
  }

  async execute(address: string) {
    try {
      console.log(chalk.blue(`Analyzing holders for: ${address}...`));
      const tokenData = await this.apiService.getTokenAnalysis(address);
      this.displayHolderAnalysis(tokenData);
    } catch (error) {
      console.error(chalk.red('Holder analysis failed:', error));
    }
  }

  private displayHolderAnalysis(data: TokenData) {
    const { tokenData: { ownersList, tokenName, tokenSymbol } } = data;

    console.log(chalk.bold(`\nHolder Analysis for ${tokenName} (${tokenSymbol}):`));
    
    // Distribution Summary
    const totalHolders = ownersList.length;
    const totalPercentage = ownersList.reduce((sum, holder) => sum + parseFloat(holder.percentage), 0);
    
    console.log('\n' + chalk.cyan('Distribution Summary:'));
    console.log(`Total Holders: ${chalk.yellow(totalHolders)}`);
    console.log(`Total Tracked: ${chalk.yellow(totalPercentage.toFixed(2))}%`);

    // Concentration Metrics
    const top10Percentage = ownersList.slice(0, 10).reduce((sum, holder) => sum + parseFloat(holder.percentage), 0);
    const top20Percentage = ownersList.slice(0, 20).reduce((sum, holder) => sum + parseFloat(holder.percentage), 0);
    
    console.log('\n' + chalk.cyan('Concentration Metrics:'));
    console.log(`Top 10 Holders: ${this.getConcentrationColor(top10Percentage)}%`);
    console.log(`Top 20 Holders: ${this.getConcentrationColor(top20Percentage)}%`);

    // Top Holders Table
    console.log('\n' + chalk.cyan('Top 10 Holders:'));
    console.log(chalk.dim('Address'.padEnd(45) + 'Amount'.padEnd(20) + 'Percentage'));
    ownersList.slice(0, 10).forEach(holder => {
      console.log(
        `${holder.address.padEnd(45)} ${
          holder.amount.padEnd(20)} ${
          chalk.yellow(holder.percentage + '%')}`
      );
    });
  }

  private getConcentrationColor(percentage: number) {
    if (percentage < 30) return chalk.green(`${percentage.toFixed(2)}`);
    if (percentage < 50) return chalk.yellow(`${percentage.toFixed(2)}`);
    return chalk.red(`${percentage.toFixed(2)}`);
  }
} 