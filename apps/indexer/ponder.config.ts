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
      address: '0x89F10AF821Bf8F4E6732cc929f1A7cc80fe57825', // Updated contract with new features
      startBlock: 34035938, // Block where new contract was deployed
    },
  },
  options: {
    maxHealthcheckDuration: 240_000,
  },
});
