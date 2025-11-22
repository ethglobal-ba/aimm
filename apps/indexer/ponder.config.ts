import { createConfig } from 'ponder';
import { AIMMABI } from './abis/AIMMABI';

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
      abi: AIMMABI,
      address: '0xbCa1C2Ccd1A0A9012Be825eD872b4F73b12f9A02',
      startBlock: 34029115, // Start from actual deployment block
    },
  },
  options: {
    maxHealthcheckDuration: 240_000,
  },
});
