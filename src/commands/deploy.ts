import { VersionedTransaction, Connection, Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { createReadStream } from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';
import type { Agent } from '../types/index.js';
import inquirer from 'inquirer';
import { StorageService } from '../services/storage.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { AgentCapability } from '../types/index.js';

const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";

export class DeployCommand {
  private connection: Connection;
  private storage: StorageService;
  private readonly __dirname = path.dirname(fileURLToPath(import.meta.url));

  constructor() {
    this.connection = new Connection(RPC_ENDPOINT, "confirmed");
    this.storage = new StorageService();
  }

  async execute() {
    try {
      await this.deployAgent();
    } catch (error) {
      console.error("Failed to deploy agent:", error);
    }
  }

  private async deployAgent() {
    // Validate environment
    const secretKey = process.env.SOL_WALLET_KEY;
    if (!secretKey) {
      throw new Error("SOL_WALLET_KEY is not set in the .env file!");
    }

    // Setup keypairs
    const signerKeyPair = Keypair.fromSecretKey(bs58.decode(secretKey));
    const mintKeypair = Keypair.generate();

    // Get agent details from local storage or prompt user
    const agent = await this.getAgentDetails();

    // Upload metadata
    const metadataUri = await this.uploadMetadata(agent);

    // Deploy token
    const signature = await this.createToken(
      signerKeyPair,
      mintKeypair,
      agent,
      metadataUri
    );

    // Update agent with mint address and save
    const updatedAgent = {
      ...agent,
      mintAddress: mintKeypair.publicKey.toBase58()
    };
    await this.storage.updateAgent(updatedAgent);

    console.log(`
    Agent Deployment Successful!
    Transaction: https://solscan.io/tx/${signature}
    Mint Address: ${mintKeypair.publicKey.toBase58()}
    Deploy Link: https://pump.fun/coin/${mintKeypair.publicKey.toBase58()}
    `);
  }

  private async uploadMetadata(agent: Agent): Promise<string> {
    if (!agent.imagePath) {
      throw new Error('Agent image path is required');
    }

    const formData = new FormData();
    formData.append("file", createReadStream(agent.imagePath));
    formData.append("name", agent.name);
    formData.append("symbol", agent.id.toUpperCase());
    formData.append("description", `${agent.description}\n\nPowered by Micron`);

    const response = await fetch("https://pump.fun/api/ipfs", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to upload metadata: ${response.statusText}`);
    }

    const { metadataUri } = await response.json() as {
      metadata: { name: string; symbol: string };
      metadataUri: string;
    };

    return metadataUri;
  }

  private async createToken(
    signerKeyPair: Keypair,
    mintKeypair: Keypair,
    agent: Agent,
    metadataUri: string
  ): Promise<string> {
    const response = await fetch("https://pumpportal.fun/api/trade-local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey: signerKeyPair.publicKey.toBase58(),
        action: "create",
        tokenMetadata: {
          name: agent.name,
          symbol: agent.id.toUpperCase(),
          uri: metadataUri,
        },
        mint: mintKeypair.publicKey.toBase58(),
        denominatedInSol: "true",
        amount: agent.initialSolAmount,
        slippage: 10,
        priorityFee: 0.0005,
        pool: "pump",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create token: ${response.statusText}`);
    }

    const txData = await response.arrayBuffer();
    const tx = VersionedTransaction.deserialize(new Uint8Array(txData));
    tx.sign([mintKeypair, signerKeyPair]);
    
    return await this.connection.sendTransaction(tx);
  }

  private async getAgentDetails(): Promise<Agent> {
    const { agentId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'agentId',
        message: 'Select an agent to deploy:',
        choices: [
          {
            name: 'Create New Agent',
            value: 'new'
          },
          ...(await this.storage.loadAgents()).map(agent => ({
            name: `${agent.name} - ${agent.description}`,
            value: agent.id
          }))
        ]
      }
    ]);

    // Add SOL amount prompt
    const { solAmount } = await inquirer.prompt([
      {
        type: 'input',
        name: 'solAmount',
        message: 'Enter initial SOL amount for liquidity:',
        default: '0.01',
        validate: (input: string) => {
          const num = parseFloat(input);
          return !isNaN(num) && num > 0 && num <= 10 || 'Please enter a valid amount between 0 and 10 SOL';
        }
      }
    ]);

    if (agentId === 'new') {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'id',
          message: 'Enter agent ID (lowercase, no spaces):',
          validate: (input: string) => /^[a-z0-9-]+$/.test(input)
        },
        {
          type: 'input',
          name: 'name',
          message: 'Enter agent name:',
          validate: (input: string) => input.length >= 3
        },
        {
          type: 'input',
          name: 'description',
          message: 'Enter agent description:',
          validate: (input: string) => input.length >= 10
        },
        {
          type: 'list',
          name: 'capabilities',
          message: 'Select agent capabilities:',
          choices: Object.values(AgentCapability),
          default: [AgentCapability.TOKEN_ANALYSIS]
        },
        {
          type: 'input',
          name: 'systemPrompt',
          message: 'Enter agent system prompt:',
          validate: (input: string) => input.length >= 50
        }
      ]);

      const imagePath = path.resolve(this.__dirname, '../../assets/agent_image.jpg');
      
      const agent: Agent = {
        ...answers,
        capabilities: [answers.capabilities],
        imagePath,
        initialSolAmount: solAmount
      };

      // Save to local storage
      await this.storage.saveAgent(agent);
      return agent;
    } else {
      const agent = (await this.storage.loadAgents()).find(a => a.id === agentId)!;
      return {
        ...agent,
        imagePath: path.resolve(this.__dirname, '../../assets/agent_image.jpg'),
        initialSolAmount: solAmount
      };
    }
  }
} 