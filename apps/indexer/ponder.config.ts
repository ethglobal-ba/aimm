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
      address: '0xD2930a818D2FE1028B59155a9e8f2B524a231923', // Latest contract deployment
      startBlock: 34053498, // Block where latest contract was deployed
    },
  },
});
