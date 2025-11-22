export const AIMMABI =
[
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_driftPercentagePoints",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_maxSpendAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_slippageToleranceBps",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "defaultConfig",
    "inputs": [],
    "outputs": [
      {
        "name": "driftPercentagePoints",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "maxSpendAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "slippageToleranceBps",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "expectedAuthor",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "expectedWorkflowId",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "expectedWorkflowName",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes10",
        "internalType": "bytes10"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "externalMarketIds",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "externalMarkets",
    "inputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "platform",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "marketName",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "optionAText",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "optionBText",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "optionACurrentExternalPrice",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "optionBCurrentExternalPrice",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "optionACurrentFairPrice",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "optionBCurrentFairPrice",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "lastCurrentPriceUpdate",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "lastFairPriceUpdate",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "volume",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "minPriceDifference",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "maxSpendAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "slippageToleranceBps",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "status",
        "type": "uint8",
        "internalType": "enum AIMM.MarketStatus"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "forwarderAddress",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAllMarketIds",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string[]",
        "internalType": "string[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getMarket",
    "inputs": [
      {
        "name": "externalMarketId",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "market",
        "type": "tuple",
        "internalType": "struct AIMM.ExternalMarket",
        "components": [
          {
            "name": "platform",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "marketName",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "optionAText",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "optionBText",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "optionACurrentExternalPrice",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "optionBCurrentExternalPrice",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "optionACurrentFairPrice",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "optionBCurrentFairPrice",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "lastCurrentPriceUpdate",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "lastFairPriceUpdate",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "volume",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "minPriceDifference",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "maxSpendAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "slippageToleranceBps",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum AIMM.MarketStatus"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isResultAnomalous",
    "inputs": [
      {
        "name": "_prospectiveResult",
        "type": "tuple",
        "internalType": "struct AIMM.WorkflowResult",
        "components": [
          {
            "name": "workflowName",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "platform",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "externalMarketId",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "optionAPrice",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "optionBPrice",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "volume",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum AIMM.MarketStatus"
          }
        ]
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "latestResult",
    "inputs": [],
    "outputs": [
      {
        "name": "workflowName",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "platform",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "externalMarketId",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "optionAPrice",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "optionBPrice",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "volume",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "status",
        "type": "uint8",
        "internalType": "enum AIMM.MarketStatus"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "onReport",
    "inputs": [
      {
        "name": "metadata",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "report",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "onboardMarket",
    "inputs": [
      {
        "name": "params",
        "type": "tuple",
        "internalType": "struct AIMM.OnboardMarketParams",
        "components": [
          {
            "name": "externalMarketId",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "platform",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "marketName",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "optionAText",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "optionBText",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "optionACurrentExternalPrice",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "optionBCurrentExternalPrice",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "initialVolume",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "resultCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "results",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "workflowName",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "platform",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "externalMarketId",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "optionAPrice",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "optionBPrice",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "volume",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "status",
        "type": "uint8",
        "internalType": "enum AIMM.MarketStatus"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "setExpectedAuthor",
    "inputs": [
      {
        "name": "_author",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setExpectedWorkflowId",
    "inputs": [
      {
        "name": "_id",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setExpectedWorkflowName",
    "inputs": [
      {
        "name": "_name",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setForwarderAddress",
    "inputs": [
      {
        "name": "_forwarder",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "shouldBalancePrice",
    "inputs": [
      {
        "name": "externalMarketId",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "shouldBalance",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "driftA",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "driftB",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "supportsInterface",
    "inputs": [
      {
        "name": "interfaceId",
        "type": "bytes4",
        "internalType": "bytes4"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "pure"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      {
        "name": "newOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateDefaultConfig",
    "inputs": [
      {
        "name": "driftPercentage",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "maxSpend",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "slippageBps",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateMarketConfig",
    "inputs": [
      {
        "name": "externalMarketId",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "minPriceDiff",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "maxSpend",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "slippageBps",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "updateMarketStatus",
    "inputs": [
      {
        "name": "externalMarketId",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "newStatus",
        "type": "uint8",
        "internalType": "enum AIMM.MarketStatus"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "CurrentPricesUpdated",
    "inputs": [
      {
        "name": "platform",
        "type": "string",
        "indexed": true,
        "internalType": "string"
      },
      {
        "name": "externalMarketId",
        "type": "string",
        "indexed": true,
        "internalType": "string"
      },
      {
        "name": "extPriceA",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "extPriceB",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "DefaultConfigUpdated",
    "inputs": [
      {
        "name": "driftPercentage",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "maxSpend",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "slippage",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "FairPricesUpdated",
    "inputs": [
      {
        "name": "platform",
        "type": "string",
        "indexed": true,
        "internalType": "string"
      },
      {
        "name": "externalMarketId",
        "type": "string",
        "indexed": true,
        "internalType": "string"
      },
      {
        "name": "fairPriceA",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "fairPriceB",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MarketConfigUpdated",
    "inputs": [
      {
        "name": "platform",
        "type": "string",
        "indexed": true,
        "internalType": "string"
      },
      {
        "name": "externalMarketId",
        "type": "string",
        "indexed": true,
        "internalType": "string"
      },
      {
        "name": "minPriceDiff",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "maxSpend",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "slippage",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MarketOnboarded",
    "inputs": [
      {
        "name": "platform",
        "type": "string",
        "indexed": true,
        "internalType": "string"
      },
      {
        "name": "externalMarketId",
        "type": "string",
        "indexed": true,
        "internalType": "string"
      },
      {
        "name": "marketName",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "optionA",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "optionB",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MarketStatusChanged",
    "inputs": [
      {
        "name": "platform",
        "type": "string",
        "indexed": true,
        "internalType": "string"
      },
      {
        "name": "externalMarketId",
        "type": "string",
        "indexed": true,
        "internalType": "string"
      },
      {
        "name": "newStatus",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum AIMM.MarketStatus"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ResultUpdated",
    "inputs": [
      {
        "name": "resultId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "finalResult",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "InvalidAuthor",
    "inputs": [
      {
        "name": "received",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "expected",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "InvalidSender",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "expected",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "InvalidWorkflowId",
    "inputs": [
      {
        "name": "received",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "expected",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ]
  },
  {
    "type": "error",
    "name": "InvalidWorkflowName",
    "inputs": [
      {
        "name": "received",
        "type": "bytes10",
        "internalType": "bytes10"
      },
      {
        "name": "expected",
        "type": "bytes10",
        "internalType": "bytes10"
      }
    ]
  },
  {
    "type": "error",
    "name": "MarketAlreadyExists",
    "inputs": [
      {
        "name": "marketId",
        "type": "string",
        "internalType": "string"
      }
    ]
  },
  {
    "type": "error",
    "name": "MarketNotOpen",
    "inputs": [
      {
        "name": "marketId",
        "type": "string",
        "internalType": "string"
      }
    ]
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ]
  }
] as const;
