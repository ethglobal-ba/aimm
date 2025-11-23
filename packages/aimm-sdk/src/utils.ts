import { MarketStatus } from "./contract/types";

export const convertKalshiCREStatusToContractStatus = (status: string): MarketStatus => {
  switch (status) {
    case 'unopened':
      return MarketStatus.Inactive;
    case 'open':
      return MarketStatus.Active;
    case 'settled':
      return MarketStatus.ClosedInternal;
    case 'closed_external':
      return MarketStatus.ClosedExternal;
  }
};