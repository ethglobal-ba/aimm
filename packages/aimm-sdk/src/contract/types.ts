import { aimmAbi } from '@aimm/common';

export const AIMM_CONTRACT_CONFIG = {
  address: '0x189E2026Ec14699185A6c97dFfdDfB3853FbD3a8' as const,
  abi: aimmAbi,
  chainId: 84532, // Base Sepolia
};

// Market Status enum matching the contract
export enum MarketStatus {
  Inactive = 0,
  Active = 1,
  ClosedInternal = 2,
  ClosedExternal = 3,
}

// Platform enum matching the contract
export enum Platform {
  KALSHI = 0,
  LIMITLESS = 1,
  TRUMPFUN = 2,
}
