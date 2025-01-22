import { APIService } from '../services/api.js';
import chalk from 'chalk';
import type { TokenData } from '../types/index.js';

export class CompareCommand {
  private apiService: APIService;

  constructor() {
    this.apiService = new APIService();
  }

  async execute(address1: string, address2: string) {
    try {
      console.log(chalk.blue(`Comparing tokens:\n${address1}\n${address2}\n`));
      const [token1, token2] = await Promise.all([
        this.apiService.getTokenAnalysis(address1),
        this.apiService.getTokenAnalysis(address2)
      ]);

      this.displayComparison(token1, token2);
    } catch (error) {
      console.error(chalk.red('Comparison failed:', error));
    }
  }

  private displayComparison(token1: TokenData, token2: TokenData) {
    const t1 = token1.tokenData;
    const t2 = token2.tokenData;

    console.log(chalk.bold('\nToken Comparison:'));
    
    // Basic Info
    console.log('\n' + chalk.cyan('Basic Information:'));
    this.compareRow('Name', t1.tokenName, t2.tokenName);
    this.compareRow('Symbol', t1.tokenSymbol, t2.tokenSymbol);
    this.compareRow('Market Cap', `$${t1.marketCap.toLocaleString()}`, `$${t2.marketCap.toLocaleString()}`);
    
    // Risk Scores
    console.log('\n' + chalk.cyan('Risk Analysis:'));
    this.compareRow('Risk Score', `${t1.score}/100`, `${t2.score}/100`);
    this.compareRow('High Risks', t1.indicatorData.high.count.toString(), t2.indicatorData.high.count.toString());
    this.compareRow('Moderate Risks', t1.indicatorData.moderate.count.toString(), t2.indicatorData.moderate.count.toString());
    
    // Liquidity
    console.log('\n' + chalk.cyan('Liquidity:'));
    const lp1 = t1.liquidityList[0]?.raydium?.amount || 0;
    const lp2 = t2.liquidityList[0]?.raydium?.amount || 0;
    this.compareRow('Liquidity', lp1.toString(), lp2.toString());
  }

  private compareRow(label: string, value1: string, value2: string) {
    const arrow = value1 === value2 ? '=' : (value1 > value2 ? '↑' : '↓');
    const arrowColor = value1 === value2 ? chalk.blue : (value1 > value2 ? chalk.green : chalk.red);
    
    console.log(`${chalk.dim(label.padEnd(15))} ${value1.padEnd(20)} ${arrowColor(arrow)} ${value2}`);
  }
} 