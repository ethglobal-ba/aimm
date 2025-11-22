import { createConfig } from 'ponder';
import { AIMMABI } from './abis/AIMMABI';

export default createConfig({
  chains: {
    baseSepolia: {
      id: 84532,
      rpc: process.env.PONDER_RPC_URL_84532!,
    },
  },
  contracts: {
    AIMM: {
      chain: 'baseSepolia',
      abi: AIMMABI,
      address: '0xe4F09E868fFd477FC3D14F54b543DbCDAaE9Ad9c',
      startBlock: 34000803, // Block number from deployment
    },
  },
});
