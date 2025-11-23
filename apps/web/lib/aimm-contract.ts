import { aimmAbi } from './contract.types';

export const AIMM_CONTRACT_CONFIG = {
  address: '0x53B3B952320E4e38887e85329a5A6E0dFBd5eF10' as const,
  abi: aimmAbi,
  chainId: 84532, // Base Sepolia
} as const;

export enum MarketStatus {
  Inactive = 0,
  Active = 1,
  ClosedInternal = 2,
  ClosedExternal = 3,
}

export enum Platform {
  KALSHI = 0,
  LIMITLESS = 1,
  TRUMPFUN = 2,
}
