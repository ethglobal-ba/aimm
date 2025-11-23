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
      address: '0x64F65c2366BEFC2540c9312A794f0DAb5c3952F4', // Latest contract deployment
      startBlock: 34056926, // Block where latest contract was deployed
    },
  },
});
