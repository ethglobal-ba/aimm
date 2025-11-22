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
      address: '0x89F10AF821Bf8F4E6732cc929f1A7cc80fe57825', // Latest deployWithKalshi contract deployment
      startBlock: 34035938, // Block where deployWithKalshi contract was deployed (0x207609e)
    },
  },
});
