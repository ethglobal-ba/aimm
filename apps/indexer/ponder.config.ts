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
      address: '0xe09e0bee97a644fa4d6e0a99e6d61c8ca1c521a1', // Latest contract deployment
      startBlock: 34039584, // Block where latest contract was deployed
    },
  },
});
