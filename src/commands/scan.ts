import { APIService } from '../services/api.js';
import chalk from 'chalk';
import type { TokenData } from '../types/index.js';

export class ScanCommand {
  private apiService: APIService;

  constructor() {
    this.apiService = new APIService();
  }

  async execute(address: string) {
    try {
      console.log(chalk.blue(`Scanning address: ${address}...`));
      const tokenData = await this.apiService.getTokenAnalysis(address);
      this.displaySecurityScan(tokenData);
    } catch (error) {
      console.error(chalk.red('Scan failed:', error));
    }
  }

  private displaySecurityScan(data: TokenData) {
    const { tokenData: { indicatorData, auditRisk } } = data;

    console.log(chalk.bold('\nSecurity Scan Results:'));
    
    // High Risk Indicators
    console.log(chalk.red('\nHigh Risk Indicators:'), `(${indicatorData.high.count})`);
    const highRisks = JSON.parse(indicatorData.high.details);
    Object.entries(highRisks).forEach(([risk, exists]) => {
      console.log(exists ? chalk.red('⚠') : chalk.green('✓'), risk);
    });

    // Moderate Risk Indicators
    console.log(chalk.yellow('\nModerate Risk Indicators:'), `(${indicatorData.moderate.count})`);
    const moderateRisks = JSON.parse(indicatorData.moderate.details);
    Object.entries(moderateRisks).forEach(([risk, exists]) => {
      console.log(exists ? chalk.yellow('⚠') : chalk.green('✓'), risk);
    });

    // Audit Results
    console.log(chalk.cyan('\nAudit Checks:'));
    Object.entries(auditRisk).forEach(([check, passed]) => {
      console.log(passed ? chalk.green('✓') : chalk.red('⚠'), check);
    });
  }
} 