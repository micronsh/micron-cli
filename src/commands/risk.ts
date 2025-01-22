import { APIService } from '../services/api.js';
import chalk from 'chalk';
import type { TokenData } from '../types/index.js';

export class RiskCommand {
  private apiService: APIService;

  constructor() {
    this.apiService = new APIService();
  }

  async execute(address: string) {
    try {
      console.log(chalk.blue(`Generating risk report for: ${address}...`));
      const tokenData = await this.apiService.getTokenAnalysis(address);
      this.displayRiskReport(tokenData);
    } catch (error) {
      console.error(chalk.red('Risk analysis failed:', error));
    }
  }

  private displayRiskReport(data: TokenData) {
    const { tokenData: { score, marketCap, ownersList } } = data;

    console.log(chalk.bold('\nRisk Report:'));
    
    // Overall Score
    console.log('\nRisk Score:', this.getRiskColor(score)(`${score}/100`));
    
    // Market Cap Analysis
    console.log('\nMarket Cap:', chalk.cyan(`$${marketCap.toLocaleString()}`));
    
    // Ownership Concentration
    console.log('\nOwnership Concentration:');
    const top10Holders = ownersList.slice(0, 10);
    const top10Percentage = top10Holders.reduce((sum, holder) => sum + parseFloat(holder.percentage), 0);
    console.log(`Top 10 Holders: ${chalk.yellow(top10Percentage.toFixed(2))}%`);
  }

  private getRiskColor(score: number) {
    if (score >= 70) return chalk.green;
    if (score >= 50) return chalk.yellow;
    return chalk.red;
  }
} 