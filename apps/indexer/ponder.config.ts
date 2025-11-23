// import { aimmAbi } from '@aimm/common';
import { createConfig } from 'ponder';
import { aimmAbi } from './src/contract.types';

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
      address: '0x189E2026Ec14699185A6c97dFfdDfB3853FbD3a8', // Latest contract deployment
      startBlock: 34045730, // Block where latest contract was deployed
    },
  },
});
