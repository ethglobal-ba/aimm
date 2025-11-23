//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AIMM
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const aimmAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_driftPercentagePoints', internalType: 'uint256', type: 'uint256' },
      { name: '_maxSpendAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_slippageToleranceBps', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultConfig',
    outputs: [
      { name: 'driftPercentagePoints', internalType: 'uint256', type: 'uint256' },
      { name: 'maxSpendAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'slippageToleranceBps', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'expectedAuthor',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'expectedWorkflowId',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'expectedWorkflowName',
    outputs: [{ name: '', internalType: 'bytes10', type: 'bytes10' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'externalMarketIds',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'string', type: 'string' }],
    name: 'externalMarkets',
    outputs: [
      { name: 'platform', internalType: 'enum AIMM.Platforms', type: 'uint8' },
      { name: 'marketName', internalType: 'string', type: 'string' },
      { name: 'subtitle', internalType: 'string', type: 'string' },
      { name: 'eventTicker', internalType: 'string', type: 'string' },
      { name: 'optionACurrentExternalPrice', internalType: 'uint256', type: 'uint256' },
      { name: 'optionBCurrentExternalPrice', internalType: 'uint256', type: 'uint256' },
      { name: 'optionACurrentFairPrice', internalType: 'uint256', type: 'uint256' },
      { name: 'optionBCurrentFairPrice', internalType: 'uint256', type: 'uint256' },
      { name: 'lastCurrentPriceUpdate', internalType: 'uint256', type: 'uint256' },
      { name: 'lastFairPriceUpdate', internalType: 'uint256', type: 'uint256' },
      { name: 'volume', internalType: 'uint256', type: 'uint256' },
      { name: 'imageUrl', internalType: 'string', type: 'string' },
      { name: 'status', internalType: 'enum AIMM.MarketStatus', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'forwarderAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAllMarketIds',
    outputs: [{ name: '', internalType: 'string[]', type: 'string[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'externalMarketId', internalType: 'string', type: 'string' }],
    name: 'getMarket',
    outputs: [
      {
        name: 'market',
        internalType: 'struct AIMM.ExternalMarket',
        type: 'tuple',
        components: [
          { name: 'platform', internalType: 'enum AIMM.Platforms', type: 'uint8' },
          { name: 'marketName', internalType: 'string', type: 'string' },
          { name: 'subtitle', internalType: 'string', type: 'string' },
          { name: 'eventTicker', internalType: 'string', type: 'string' },
          { name: 'optionACurrentExternalPrice', internalType: 'uint256', type: 'uint256' },
          { name: 'optionBCurrentExternalPrice', internalType: 'uint256', type: 'uint256' },
          { name: 'optionACurrentFairPrice', internalType: 'uint256', type: 'uint256' },
          { name: 'optionBCurrentFairPrice', internalType: 'uint256', type: 'uint256' },
          { name: 'lastCurrentPriceUpdate', internalType: 'uint256', type: 'uint256' },
          { name: 'lastFairPriceUpdate', internalType: 'uint256', type: 'uint256' },
          { name: 'volume', internalType: 'uint256', type: 'uint256' },
          { name: 'imageUrl', internalType: 'string', type: 'string' },
          { name: 'status', internalType: 'enum AIMM.MarketStatus', type: 'uint8' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_prospectiveResult',
        internalType: 'struct AIMM.WorkflowResult',
        type: 'tuple',
        components: [
          { name: 'workflowName', internalType: 'string', type: 'string' },
          { name: 'platform', internalType: 'enum AIMM.Platforms', type: 'uint8' },
          { name: 'ticker', internalType: 'string', type: 'string' },
          { name: 'optionAPrice', internalType: 'uint256', type: 'uint256' },
          { name: 'optionBPrice', internalType: 'uint256', type: 'uint256' },
          { name: 'volume', internalType: 'uint256', type: 'uint256' },
          { name: 'status', internalType: 'enum AIMM.MarketStatus', type: 'uint8' },
        ],
      },
    ],
    name: 'isResultAnomalous',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'latestResult',
    outputs: [
      { name: 'workflowName', internalType: 'string', type: 'string' },
      { name: 'platform', internalType: 'enum AIMM.Platforms', type: 'uint8' },
      { name: 'ticker', internalType: 'string', type: 'string' },
      { name: 'optionAPrice', internalType: 'uint256', type: 'uint256' },
      { name: 'optionBPrice', internalType: 'uint256', type: 'uint256' },
      { name: 'volume', internalType: 'uint256', type: 'uint256' },
      { name: 'status', internalType: 'enum AIMM.MarketStatus', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'string', type: 'string' }],
    name: 'marketConfigs',
    outputs: [
      { name: 'minPriceDifference', internalType: 'uint256', type: 'uint256' },
      { name: 'maxSpendAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'slippageToleranceBps', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'metadata', internalType: 'bytes', type: 'bytes' },
      { name: 'report', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onReport',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct AIMM.OnboardMarketParams',
        type: 'tuple',
        components: [
          { name: 'ticker', internalType: 'string', type: 'string' },
          { name: 'platform', internalType: 'enum AIMM.Platforms', type: 'uint8' },
          { name: 'marketName', internalType: 'string', type: 'string' },
          { name: 'subtitle', internalType: 'string', type: 'string' },
          { name: 'eventTicker', internalType: 'string', type: 'string' },
          { name: 'optionACurrentExternalPrice', internalType: 'uint256', type: 'uint256' },
          { name: 'optionBCurrentExternalPrice', internalType: 'uint256', type: 'uint256' },
          { name: 'initialVolume', internalType: 'uint256', type: 'uint256' },
          { name: 'imageUrl', internalType: 'string', type: 'string' },
        ],
      },
    ],
    name: 'onboardMarket',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  { type: 'function', inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'resultCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'results',
    outputs: [
      { name: 'workflowName', internalType: 'string', type: 'string' },
      { name: 'platform', internalType: 'enum AIMM.Platforms', type: 'uint8' },
      { name: 'ticker', internalType: 'string', type: 'string' },
      { name: 'optionAPrice', internalType: 'uint256', type: 'uint256' },
      { name: 'optionBPrice', internalType: 'uint256', type: 'uint256' },
      { name: 'volume', internalType: 'uint256', type: 'uint256' },
      { name: 'status', internalType: 'enum AIMM.MarketStatus', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_author', internalType: 'address', type: 'address' }],
    name: 'setExpectedAuthor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'setExpectedWorkflowId',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_name', internalType: 'string', type: 'string' }],
    name: 'setExpectedWorkflowName',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_forwarder', internalType: 'address', type: 'address' }],
    name: 'setForwarderAddress',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'externalMarketId', internalType: 'string', type: 'string' }],
    name: 'shouldBalancePrice',
    outputs: [
      { name: 'shouldBalance', internalType: 'bool', type: 'bool' },
      { name: 'driftA', internalType: 'uint256', type: 'uint256' },
      { name: 'driftB', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'driftPercentage', internalType: 'uint256', type: 'uint256' },
      { name: 'maxSpend', internalType: 'uint256', type: 'uint256' },
      { name: 'slippageBps', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'updateDefaultConfig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'externalMarketId', internalType: 'string', type: 'string' },
      { name: 'optionAFairPrice', internalType: 'uint256', type: 'uint256' },
      { name: 'optionBFairPrice', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'updateFairPrices',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'externalMarketId', internalType: 'string', type: 'string' },
      { name: 'minPriceDiff', internalType: 'uint256', type: 'uint256' },
      { name: 'maxSpend', internalType: 'uint256', type: 'uint256' },
      { name: 'slippageBps', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'updateMarketConfig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'externalMarketId', internalType: 'string', type: 'string' },
      { name: 'newStatus', internalType: 'enum AIMM.MarketStatus', type: 'uint8' },
    ],
    name: 'updateMarketStatus',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'platform', internalType: 'enum AIMM.Platforms', type: 'uint8', indexed: true },
      { name: 'tickerHash', internalType: 'string', type: 'string', indexed: true },
      { name: 'ticker', internalType: 'string', type: 'string', indexed: false },
      { name: 'extPriceA', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'extPriceB', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'CurrentPricesUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'driftPercentage', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'maxSpend', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'slippage', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'DefaultConfigUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'platform', internalType: 'enum AIMM.Platforms', type: 'uint8', indexed: true },
      { name: 'tickerHash', internalType: 'string', type: 'string', indexed: true },
      { name: 'ticker', internalType: 'string', type: 'string', indexed: false },
      { name: 'fairPriceA', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'fairPriceB', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'FairPricesUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'platform', internalType: 'enum AIMM.Platforms', type: 'uint8', indexed: true },
      { name: 'tickerHash', internalType: 'string', type: 'string', indexed: true },
      { name: 'ticker', internalType: 'string', type: 'string', indexed: false },
      { name: 'minPriceDiff', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'maxSpend', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'slippage', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'MarketConfigUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'platform', internalType: 'enum AIMM.Platforms', type: 'uint8', indexed: true },
      { name: 'tickerHash', internalType: 'string', type: 'string', indexed: true },
      { name: 'ticker', internalType: 'string', type: 'string', indexed: false },
      { name: 'marketName', internalType: 'string', type: 'string', indexed: false },
      { name: 'subtitle', internalType: 'string', type: 'string', indexed: false },
      { name: 'eventTicker', internalType: 'string', type: 'string', indexed: false },
      { name: 'volume', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'optionACurrentExternalPrice', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'optionBCurrentExternalPrice', internalType: 'uint256', type: 'uint256', indexed: false },
      { name: 'imageUrl', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'MarketOnboarded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'platform', internalType: 'enum AIMM.Platforms', type: 'uint8', indexed: true },
      { name: 'tickerHash', internalType: 'string', type: 'string', indexed: true },
      { name: 'ticker', internalType: 'string', type: 'string', indexed: false },
      { name: 'newStatus', internalType: 'enum AIMM.MarketStatus', type: 'uint8', indexed: false },
    ],
    name: 'MarketStatusChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'platform', internalType: 'enum AIMM.Platforms', type: 'uint8', indexed: true },
      { name: 'tickerHash', internalType: 'string', type: 'string', indexed: true },
      { name: 'ticker', internalType: 'string', type: 'string', indexed: false },
      { name: 'newStatus', internalType: 'enum AIMM.MarketStatus', type: 'uint8', indexed: false },
    ],
    name: 'MarketStatusUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'previousOwner', internalType: 'address', type: 'address', indexed: true },
      { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'workflowName', internalType: 'string', type: 'string', indexed: true },
      { name: 'resultId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'finalResult', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'ResultUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'workflowName', internalType: 'string', type: 'string', indexed: false }],
    name: 'UnknownWorkflow',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'workflowName', internalType: 'string', type: 'string', indexed: true },
      { name: 'resultId', internalType: 'uint256', type: 'uint256', indexed: true },
      { name: 'finalResult', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'WorkflowTriggered',
  },
  {
    type: 'error',
    inputs: [
      { name: 'received', internalType: 'address', type: 'address' },
      { name: 'expected', internalType: 'address', type: 'address' },
    ],
    name: 'InvalidAuthor',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'expected', internalType: 'address', type: 'address' },
    ],
    name: 'InvalidSender',
  },
  {
    type: 'error',
    inputs: [
      { name: 'received', internalType: 'bytes32', type: 'bytes32' },
      { name: 'expected', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'InvalidWorkflowId',
  },
  {
    type: 'error',
    inputs: [
      { name: 'received', internalType: 'bytes10', type: 'bytes10' },
      { name: 'expected', internalType: 'bytes10', type: 'bytes10' },
    ],
    name: 'InvalidWorkflowName',
  },
  {
    type: 'error',
    inputs: [{ name: 'marketId', internalType: 'string', type: 'string' }],
    name: 'MarketAlreadyExists',
  },
  { type: 'error', inputs: [{ name: 'marketId', internalType: 'string', type: 'string' }], name: 'MarketNotOpen' },
  { type: 'error', inputs: [{ name: 'owner', internalType: 'address', type: 'address' }], name: 'OwnableInvalidOwner' },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMulticall3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iMulticall3Abi = [
  {
    type: 'function',
    inputs: [
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'aggregate',
    outputs: [
      { name: 'blockNumber', internalType: 'uint256', type: 'uint256' },
      { name: 'returnData', internalType: 'bytes[]', type: 'bytes[]' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call3[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'allowFailure', internalType: 'bool', type: 'bool' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'aggregate3',
    outputs: [
      {
        name: 'returnData',
        internalType: 'struct IMulticall3.Result[]',
        type: 'tuple[]',
        components: [
          { name: 'success', internalType: 'bool', type: 'bool' },
          { name: 'returnData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call3Value[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'allowFailure', internalType: 'bool', type: 'bool' },
          { name: 'value', internalType: 'uint256', type: 'uint256' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'aggregate3Value',
    outputs: [
      {
        name: 'returnData',
        internalType: 'struct IMulticall3.Result[]',
        type: 'tuple[]',
        components: [
          { name: 'success', internalType: 'bool', type: 'bool' },
          { name: 'returnData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'blockAndAggregate',
    outputs: [
      { name: 'blockNumber', internalType: 'uint256', type: 'uint256' },
      { name: 'blockHash', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'returnData',
        internalType: 'struct IMulticall3.Result[]',
        type: 'tuple[]',
        components: [
          { name: 'success', internalType: 'bool', type: 'bool' },
          { name: 'returnData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getBasefee',
    outputs: [{ name: 'basefee', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'blockNumber', internalType: 'uint256', type: 'uint256' }],
    name: 'getBlockHash',
    outputs: [{ name: 'blockHash', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getBlockNumber',
    outputs: [{ name: 'blockNumber', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getChainId',
    outputs: [{ name: 'chainid', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentBlockCoinbase',
    outputs: [{ name: 'coinbase', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentBlockDifficulty',
    outputs: [{ name: 'difficulty', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentBlockGasLimit',
    outputs: [{ name: 'gaslimit', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentBlockTimestamp',
    outputs: [{ name: 'timestamp', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'addr', internalType: 'address', type: 'address' }],
    name: 'getEthBalance',
    outputs: [{ name: 'balance', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getLastBlockHash',
    outputs: [{ name: 'blockHash', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'requireSuccess', internalType: 'bool', type: 'bool' },
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'tryAggregate',
    outputs: [
      {
        name: 'returnData',
        internalType: 'struct IMulticall3.Result[]',
        type: 'tuple[]',
        components: [
          { name: 'success', internalType: 'bool', type: 'bool' },
          { name: 'returnData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'requireSuccess', internalType: 'bool', type: 'bool' },
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'tryBlockAndAggregate',
    outputs: [
      { name: 'blockNumber', internalType: 'uint256', type: 'uint256' },
      { name: 'blockHash', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'returnData',
        internalType: 'struct IMulticall3.Result[]',
        type: 'tuple[]',
        components: [
          { name: 'success', internalType: 'bool', type: 'bool' },
          { name: 'returnData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPyth
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPythAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32' },
      { name: 'age', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getEmaPriceNoOlderThan',
    outputs: [
      {
        name: 'price',
        internalType: 'struct PythStructs.Price',
        type: 'tuple',
        components: [
          { name: 'price', internalType: 'int64', type: 'int64' },
          { name: 'conf', internalType: 'uint64', type: 'uint64' },
          { name: 'expo', internalType: 'int32', type: 'int32' },
          { name: 'publishTime', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getEmaPriceUnsafe',
    outputs: [
      {
        name: 'price',
        internalType: 'struct PythStructs.Price',
        type: 'tuple',
        components: [
          { name: 'price', internalType: 'int64', type: 'int64' },
          { name: 'conf', internalType: 'uint64', type: 'uint64' },
          { name: 'expo', internalType: 'int32', type: 'int32' },
          { name: 'publishTime', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32' },
      { name: 'age', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getPriceNoOlderThan',
    outputs: [
      {
        name: 'price',
        internalType: 'struct PythStructs.Price',
        type: 'tuple',
        components: [
          { name: 'price', internalType: 'int64', type: 'int64' },
          { name: 'conf', internalType: 'uint64', type: 'uint64' },
          { name: 'expo', internalType: 'int32', type: 'int32' },
          { name: 'publishTime', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getPriceUnsafe',
    outputs: [
      {
        name: 'price',
        internalType: 'struct PythStructs.Price',
        type: 'tuple',
        components: [
          { name: 'price', internalType: 'int64', type: 'int64' },
          { name: 'conf', internalType: 'uint64', type: 'uint64' },
          { name: 'expo', internalType: 'int32', type: 'int32' },
          { name: 'publishTime', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'updateData', internalType: 'bytes[]', type: 'bytes[]' }],
    name: 'getTwapUpdateFee',
    outputs: [{ name: 'feeAmount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'updateData', internalType: 'bytes[]', type: 'bytes[]' }],
    name: 'getUpdateFee',
    outputs: [{ name: 'feeAmount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'updateData', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'priceIds', internalType: 'bytes32[]', type: 'bytes32[]' },
      { name: 'minPublishTime', internalType: 'uint64', type: 'uint64' },
      { name: 'maxPublishTime', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'parsePriceFeedUpdates',
    outputs: [
      {
        name: 'priceFeeds',
        internalType: 'struct PythStructs.PriceFeed[]',
        type: 'tuple[]',
        components: [
          { name: 'id', internalType: 'bytes32', type: 'bytes32' },
          {
            name: 'price',
            internalType: 'struct PythStructs.Price',
            type: 'tuple',
            components: [
              { name: 'price', internalType: 'int64', type: 'int64' },
              { name: 'conf', internalType: 'uint64', type: 'uint64' },
              { name: 'expo', internalType: 'int32', type: 'int32' },
              { name: 'publishTime', internalType: 'uint256', type: 'uint256' },
            ],
          },
          {
            name: 'emaPrice',
            internalType: 'struct PythStructs.Price',
            type: 'tuple',
            components: [
              { name: 'price', internalType: 'int64', type: 'int64' },
              { name: 'conf', internalType: 'uint64', type: 'uint64' },
              { name: 'expo', internalType: 'int32', type: 'int32' },
              { name: 'publishTime', internalType: 'uint256', type: 'uint256' },
            ],
          },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'updateData', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'priceIds', internalType: 'bytes32[]', type: 'bytes32[]' },
      { name: 'minPublishTime', internalType: 'uint64', type: 'uint64' },
      { name: 'maxPublishTime', internalType: 'uint64', type: 'uint64' },
    ],
    name: 'parsePriceFeedUpdatesUnique',
    outputs: [
      {
        name: 'priceFeeds',
        internalType: 'struct PythStructs.PriceFeed[]',
        type: 'tuple[]',
        components: [
          { name: 'id', internalType: 'bytes32', type: 'bytes32' },
          {
            name: 'price',
            internalType: 'struct PythStructs.Price',
            type: 'tuple',
            components: [
              { name: 'price', internalType: 'int64', type: 'int64' },
              { name: 'conf', internalType: 'uint64', type: 'uint64' },
              { name: 'expo', internalType: 'int32', type: 'int32' },
              { name: 'publishTime', internalType: 'uint256', type: 'uint256' },
            ],
          },
          {
            name: 'emaPrice',
            internalType: 'struct PythStructs.Price',
            type: 'tuple',
            components: [
              { name: 'price', internalType: 'int64', type: 'int64' },
              { name: 'conf', internalType: 'uint64', type: 'uint64' },
              { name: 'expo', internalType: 'int32', type: 'int32' },
              { name: 'publishTime', internalType: 'uint256', type: 'uint256' },
            ],
          },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'updateData', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'priceIds', internalType: 'bytes32[]', type: 'bytes32[]' },
      { name: 'minAllowedPublishTime', internalType: 'uint64', type: 'uint64' },
      { name: 'maxAllowedPublishTime', internalType: 'uint64', type: 'uint64' },
      { name: 'checkUniqueness', internalType: 'bool', type: 'bool' },
      { name: 'checkUpdateDataIsMinimal', internalType: 'bool', type: 'bool' },
      { name: 'storeUpdatesIfFresh', internalType: 'bool', type: 'bool' },
    ],
    name: 'parsePriceFeedUpdatesWithConfig',
    outputs: [
      {
        name: 'priceFeeds',
        internalType: 'struct PythStructs.PriceFeed[]',
        type: 'tuple[]',
        components: [
          { name: 'id', internalType: 'bytes32', type: 'bytes32' },
          {
            name: 'price',
            internalType: 'struct PythStructs.Price',
            type: 'tuple',
            components: [
              { name: 'price', internalType: 'int64', type: 'int64' },
              { name: 'conf', internalType: 'uint64', type: 'uint64' },
              { name: 'expo', internalType: 'int32', type: 'int32' },
              { name: 'publishTime', internalType: 'uint256', type: 'uint256' },
            ],
          },
          {
            name: 'emaPrice',
            internalType: 'struct PythStructs.Price',
            type: 'tuple',
            components: [
              { name: 'price', internalType: 'int64', type: 'int64' },
              { name: 'conf', internalType: 'uint64', type: 'uint64' },
              { name: 'expo', internalType: 'int32', type: 'int32' },
              { name: 'publishTime', internalType: 'uint256', type: 'uint256' },
            ],
          },
        ],
      },
      { name: 'slots', internalType: 'uint64[]', type: 'uint64[]' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'updateData', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'priceIds', internalType: 'bytes32[]', type: 'bytes32[]' },
    ],
    name: 'parseTwapPriceFeedUpdates',
    outputs: [
      {
        name: 'twapPriceFeeds',
        internalType: 'struct PythStructs.TwapPriceFeed[]',
        type: 'tuple[]',
        components: [
          { name: 'id', internalType: 'bytes32', type: 'bytes32' },
          { name: 'startTime', internalType: 'uint64', type: 'uint64' },
          { name: 'endTime', internalType: 'uint64', type: 'uint64' },
          {
            name: 'twap',
            internalType: 'struct PythStructs.Price',
            type: 'tuple',
            components: [
              { name: 'price', internalType: 'int64', type: 'int64' },
              { name: 'conf', internalType: 'uint64', type: 'uint64' },
              { name: 'expo', internalType: 'int32', type: 'int32' },
              { name: 'publishTime', internalType: 'uint256', type: 'uint256' },
            ],
          },
          { name: 'downSlotsRatio', internalType: 'uint32', type: 'uint32' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'updateData', internalType: 'bytes[]', type: 'bytes[]' }],
    name: 'updatePriceFeeds',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'updateData', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'priceIds', internalType: 'bytes32[]', type: 'bytes32[]' },
      { name: 'publishTimes', internalType: 'uint64[]', type: 'uint64[]' },
    ],
    name: 'updatePriceFeedsIfNecessary',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: true },
      { name: 'publishTime', internalType: 'uint64', type: 'uint64', indexed: false },
      { name: 'price', internalType: 'int64', type: 'int64', indexed: false },
      { name: 'conf', internalType: 'uint64', type: 'uint64', indexed: false },
    ],
    name: 'PriceFeedUpdate',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: true },
      { name: 'startTime', internalType: 'uint64', type: 'uint64', indexed: false },
      { name: 'endTime', internalType: 'uint64', type: 'uint64', indexed: false },
      { name: 'twapPrice', internalType: 'int64', type: 'int64', indexed: false },
      { name: 'twapConf', internalType: 'uint64', type: 'uint64', indexed: false },
      { name: 'downSlotsRatio', internalType: 'uint32', type: 'uint32', indexed: false },
    ],
    name: 'TwapPriceFeedUpdate',
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPythEvents
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPythEventsAbi = [
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: true },
      { name: 'publishTime', internalType: 'uint64', type: 'uint64', indexed: false },
      { name: 'price', internalType: 'int64', type: 'int64', indexed: false },
      { name: 'conf', internalType: 'uint64', type: 'uint64', indexed: false },
    ],
    name: 'PriceFeedUpdate',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'bytes32', type: 'bytes32', indexed: true },
      { name: 'startTime', internalType: 'uint64', type: 'uint64', indexed: false },
      { name: 'endTime', internalType: 'uint64', type: 'uint64', indexed: false },
      { name: 'twapPrice', internalType: 'int64', type: 'int64', indexed: false },
      { name: 'twapConf', internalType: 'uint64', type: 'uint64', indexed: false },
      { name: 'downSlotsRatio', internalType: 'uint32', type: 'uint32', indexed: false },
    ],
    name: 'TwapPriceFeedUpdate',
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IReceiver
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iReceiverAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'metadata', internalType: 'bytes', type: 'bytes' },
      { name: 'report', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onReport',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IReceiverTemplate
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iReceiverTemplateAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'expectedAuthor',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'expectedWorkflowId',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'expectedWorkflowName',
    outputs: [{ name: '', internalType: 'bytes10', type: 'bytes10' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'forwarderAddress',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'metadata', internalType: 'bytes', type: 'bytes' },
      { name: 'report', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onReport',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  { type: 'function', inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [{ name: '_author', internalType: 'address', type: 'address' }],
    name: 'setExpectedAuthor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_id', internalType: 'bytes32', type: 'bytes32' }],
    name: 'setExpectedWorkflowId',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_name', internalType: 'string', type: 'string' }],
    name: 'setExpectedWorkflowName',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_forwarder', internalType: 'address', type: 'address' }],
    name: 'setForwarderAddress',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'previousOwner', internalType: 'address', type: 'address', indexed: true },
      { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'error',
    inputs: [
      { name: 'received', internalType: 'address', type: 'address' },
      { name: 'expected', internalType: 'address', type: 'address' },
    ],
    name: 'InvalidAuthor',
  },
  {
    type: 'error',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'expected', internalType: 'address', type: 'address' },
    ],
    name: 'InvalidSender',
  },
  {
    type: 'error',
    inputs: [
      { name: 'received', internalType: 'bytes32', type: 'bytes32' },
      { name: 'expected', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'InvalidWorkflowId',
  },
  {
    type: 'error',
    inputs: [
      { name: 'received', internalType: 'bytes10', type: 'bytes10' },
      { name: 'expected', internalType: 'bytes10', type: 'bytes10' },
    ],
    name: 'InvalidWorkflowName',
  },
  { type: 'error', inputs: [{ name: 'owner', internalType: 'address', type: 'address' }], name: 'OwnableInvalidOwner' },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Ownable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ownableAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  { type: 'function', inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'previousOwner', internalType: 'address', type: 'address', indexed: true },
      { name: 'newOwner', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
  { type: 'error', inputs: [{ name: 'owner', internalType: 'address', type: 'address' }], name: 'OwnableInvalidOwner' },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PythOracle
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pythOracleAbi = [
  {
    type: 'constructor',
    inputs: [{ name: 'pythContract', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'priceUpdate', internalType: 'bytes[]', type: 'bytes[]' },
      { name: 'priceFeedId', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'updatePrice',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'priceFeedId', internalType: 'bytes32', type: 'bytes32', indexed: true },
      { name: 'price', internalType: 'int64', type: 'int64', indexed: false },
      { name: 'publishTime', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'PriceUpdated',
  },
] as const;
