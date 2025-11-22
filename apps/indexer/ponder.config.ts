// import { aimmAbi } from '@aimm/common';
import { aimmAbi } from './src/contract.types';
import { createConfig } from 'ponder';

export default createConfig({
  database: {
    kind: 'postgres',
    connectionString: process.env.DATABASE_URL!,
  },
  chains: {
    baseSepolia: {
      id: 84532,
      rpc: process.env.PONDER_RPC_URL_84532!,
      maxRequestsPerSecond: 50,
      pollingInterval: 1000,
    },
  },
  contracts: {
    AIMM: {
      chain: 'baseSepolia',
      abi: aimmAbi,
      address: '0xff3F84978B81f0457584919213fdDeBD579E74B1',
      startBlock: 34030442, // Start from a safe block that exists
    },
  },
  options: {
    maxHealthcheckDuration: 240_000,
  },
});
