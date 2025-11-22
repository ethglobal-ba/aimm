export const AIMMABI = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_driftPercentagePoints',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_maxSpendAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '_slippageToleranceBps',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'defaultConfig',
    inputs: [],
    outputs: [
      {
        name: 'driftPercentagePoints',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'maxSpendAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'slippageToleranceBps',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAllMarketIds',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string[]',
        internalType: 'string[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getMarket',
    inputs: [
      {
        name: 'marketId',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [
      {
        name: 'market',
        type: 'tuple',
        internalType: 'struct AIMM.ExternalMarket',
        components: [
          {
            name: 'externalId',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'marketName',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'optionAText',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'optionBText',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'optionACurrentExternalPrice',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'optionBCurrentExternalPrice',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'optionACurrentFairPrice',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'optionBCurrentFairPrice',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'lastPriceUpdate',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'minPriceDifference',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'maxSpendAmount',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'slippageToleranceBps',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'status',
            type: 'uint8',
            internalType: 'enum AIMM.MarketStatus',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'onboardMarket',
    inputs: [
      {
        name: 'marketId',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'externalId',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'marketName',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'optionAText',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'optionBText',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'optionACurrentExternalPrice',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'optionBCurrentExternalPrice',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'initialVolume',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'shouldBalancePrice',
    inputs: [
      {
        name: 'marketId',
        type: 'string',
        internalType: 'string',
      },
    ],
    outputs: [
      {
        name: 'shouldBalance',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'driftA',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'driftB',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'updateMarketConfig',
    inputs: [
      {
        name: 'marketId',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'minPriceDiff',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'maxSpend',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'slippageBps',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateMarketStatus',
    inputs: [
      {
        name: 'marketId',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'newStatus',
        type: 'uint8',
        internalType: 'enum AIMM.MarketStatus',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateDefaultConfig',
    inputs: [
      {
        name: 'driftPercentage',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'maxSpend',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'slippageBps',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'MarketOnboarded',
    inputs: [
      {
        name: 'platform',
        type: 'string',
        indexed: true,
        internalType: 'string',
      },
      {
        name: 'marketId',
        type: 'string',
        indexed: true,
        internalType: 'string',
      },
      {
        name: 'marketName',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'optionA',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'optionB',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MarketConfigUpdated',
    inputs: [
      {
        name: 'platform',
        type: 'string',
        indexed: true,
        internalType: 'string',
      },
      {
        name: 'marketId',
        type: 'string',
        indexed: true,
        internalType: 'string',
      },
      {
        name: 'minPriceDiff',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'maxSpend',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'slippage',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MarketStatusChanged',
    inputs: [
      {
        name: 'platform',
        type: 'string',
        indexed: true,
        internalType: 'string',
      },
      {
        name: 'marketId',
        type: 'string',
        indexed: true,
        internalType: 'string',
      },
      {
        name: 'newStatus',
        type: 'uint8',
        indexed: false,
        internalType: 'enum AIMM.MarketStatus',
      },
    ],
    anonymous: false,
  },
] as const