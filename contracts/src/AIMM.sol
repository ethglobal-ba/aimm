// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {IReceiverTemplate} from "./IReceiverTemplate.sol";

/**
 * @title AIMM (Automated Intelligent Market Maker)
 * @notice This contract manages external market configurations and automated price balancing
 * @dev Implements market onboarding and price drift monitoring for automated trading
 */
contract AIMM is IReceiverTemplate {
    // Struct to hold the data sent in a report from the workflow
    enum MarketStatus {
        Inactive, // Market is onboarded but not being tracked yet (default)
        Active, // We are tracking and will automatically balance price
        ClosedInternal, // We have chosen to stop tracking the market irrespective of external status
        ClosedExternal // The external market has closed and we have chosen to stop tracking the market
    }
    enum Platforms {
        KALSHI,
        LIMITLESS,
        TRUMPFUN
    }

    struct WorkflowResult {
        string workflowName; // currentPriceFetch, fairPriceFetch, closeMarket
        Platforms platform; // Platform name (e.g., "kalshi") used to calculate market ID
        string ticker; // External market ID used to calculate market ID
        uint256 optionAPrice; // Price for option A
        uint256 optionBPrice; // Price for option B
        uint256 volume; // Trading volume
        MarketStatus status; // Market status
    }

    // Default configuration for market automation triggers
    struct DefaultConfig {
        uint256 driftPercentagePoints; // Percentage points of drift to trigger automation (basis points)
        uint256 maxSpendAmount; // Maximum amount allowed to spend for balancing
        uint256 slippageToleranceBps; // Slippage tolerance in basis points
    }

    // Market-specific configuration
    struct MarketConfig {
        uint256 minPriceDifference; // Minimum price difference to trigger action
        uint256 maxSpendAmount; // Max amount allowed to spend for this market
        uint256 slippageToleranceBps; // Slippage tolerance for this market
    }

    // Price data for market onboarding
    struct PriceData {
        uint256 optionACurrentExternalPrice;
        uint256 optionBCurrentExternalPrice;
        uint256 initialVolume;
    }

    // Market metadata for onboarding
    struct MarketData {
        string ticker;
        Platforms platform;
        string marketName;
        string subtitle;
        string eventTicker;
        string imageUrl;
    }

    // Input parameters for onboarding a market
    struct OnboardMarketParams {
        string ticker;
        Platforms platform;
        string marketName;
        string subtitle;
        string eventTicker;
        uint256 optionACurrentExternalPrice;
        uint256 optionBCurrentExternalPrice;
        uint256 initialVolume;
        string imageUrl;
    }

    // Configuration and data for each external market
    struct ExternalMarket {
        Platforms platform; // Platform name (e.g., "kalshi", "polymarket")
        string marketName; // Human readable market name
        string subtitle; // Market subtitle
        string eventTicker; // Event ticker identifier
        uint256 optionACurrentExternalPrice; // Current price on external market
        uint256 optionBCurrentExternalPrice; // Current price on external market
        uint256 optionACurrentFairPrice; // Current fair price (internal)
        uint256 optionBCurrentFairPrice; // Current fair price (internal)
        uint256 lastCurrentPriceUpdate; // Timestamp of last current price update
        uint256 lastFairPriceUpdate; // Timestamp of last fair price update
        uint256 volume; // Trading volume for this market
        string imageUrl;
        MarketStatus status;
    }

    error MarketNotOpen(string marketId);
    error MarketAlreadyExists(string marketId);
    // error UnknownWorkflow(string workflowName);

    // --- State Variables ---
    WorkflowResult public latestResult;
    uint256 public resultCount;

    mapping(uint256 => WorkflowResult) public results;

    // Market management state
    DefaultConfig public defaultConfig;
    mapping(string => ExternalMarket) public externalMarkets;
    mapping(string => MarketConfig) public marketConfigs;
    string[] public externalMarketIds;

    // --- Events ---
    event ResultUpdated(string indexed workflowName, uint256 indexed resultId, uint256 finalResult);
    event WorkflowTriggered(
        string indexed workflowName, uint256 indexed resultId, uint256 finalResult
    );
    event MarketOnboarded(
        Platforms indexed platform,
        string indexed tickerHash,
        string ticker,
        string marketName,
        string subtitle,
        string eventTicker,
        uint256 volume,
        uint256 optionACurrentExternalPrice,
        uint256 optionBCurrentExternalPrice,
        string imageUrl
    );

    event MarketConfigUpdated(
        Platforms indexed platform,
        string indexed tickerHash,
        string ticker,
        uint256 minPriceDiff,
        uint256 maxSpend,
        uint256 slippage
    );
    event CurrentPricesUpdated(
        Platforms indexed platform,
        string indexed tickerHash,
        string ticker,
        uint256 extPriceA,
        uint256 extPriceB
    );
    event FairPricesUpdated(
        Platforms indexed platform,
        string indexed tickerHash,
        string ticker,
        uint256 fairPriceA,
        uint256 fairPriceB
    );
    event MarketStatusChanged(
        Platforms indexed platform, string indexed tickerHash, string ticker, MarketStatus newStatus
    );
    event MarketStatusUpdated(
        Platforms indexed platform, string indexed tickerHash, string ticker, MarketStatus newStatus
    );
    event DefaultConfigUpdated(uint256 driftPercentage, uint256 maxSpend, uint256 slippage);

    //TODO Demo event to get rid of revert, troubleshooting chainlink stuff
    event UnknownWorkflow(string workflowName);

    /**
     * @dev Initialize contract with default configuration
     * @param _driftPercentagePoints Default drift percentage points to trigger automation
     * @param _maxSpendAmount Default maximum spend amount
     * @param _slippageToleranceBps Default slippage tolerance in basis points
     */
    constructor(
        uint256 _driftPercentagePoints,
        uint256 _maxSpendAmount,
        uint256 _slippageToleranceBps
    ) {
        defaultConfig = DefaultConfig({
            driftPercentagePoints: _driftPercentagePoints,
            maxSpendAmount: _maxSpendAmount,
            slippageToleranceBps: _slippageToleranceBps
        });
    }

    modifier marketNotExists(string memory externalMarketId) {
        require(
            bytes(externalMarkets[externalMarketId].marketName).length == 0, "Market already exists"
        );
        _;
    }

    modifier marketMustExist(string memory externalMarketId) {
        require(
            bytes(externalMarkets[externalMarketId].marketName).length > 0, "Market does not exist"
        );
        _;
    }

    /**
     * @notice Onboard a new market into the system
     * @param params Struct containing all market parameters
     */
    function onboardMarket(OnboardMarketParams calldata params)
        public
        onlyOwner
        marketNotExists(params.ticker)
    {
        require(bytes(params.ticker).length > 0, "Ticker cannot be empty");
        require(bytes(params.marketName).length > 0, "Market name cannot be empty");

        externalMarkets[params.ticker] = ExternalMarket({
            platform: params.platform,
            marketName: params.marketName,
            subtitle: params.subtitle,
            eventTicker: params.eventTicker,
            optionACurrentExternalPrice: params.optionACurrentExternalPrice,
            optionBCurrentExternalPrice: params.optionBCurrentExternalPrice,
            optionACurrentFairPrice: 0,
            optionBCurrentFairPrice: 0,
            lastCurrentPriceUpdate: 0,
            lastFairPriceUpdate: 0,
            volume: params.initialVolume,
            imageUrl: params.imageUrl,
            status: MarketStatus.Inactive
        });

        marketConfigs[params.ticker] = MarketConfig({
            minPriceDifference: defaultConfig.driftPercentagePoints,
            maxSpendAmount: defaultConfig.maxSpendAmount,
            slippageToleranceBps: defaultConfig.slippageToleranceBps
        });

        externalMarketIds.push(params.ticker);

        emit MarketOnboarded(
            params.platform,
            params.ticker,
            params.ticker,
            params.marketName,
            params.subtitle,
            params.eventTicker,
            params.initialVolume,
            params.optionACurrentExternalPrice,
            params.optionBCurrentExternalPrice,
            params.imageUrl
        );
    }

    /**
     * @notice Update external prices for a market (called internally by _processReport)
     * @param externalMarketId The market to update
     * @param optionAPrice New external price for option A
     * @param optionBPrice New external price for option B
     * @param volume New trading volume
     */
    function _updateExternalMarketData(
        string memory externalMarketId,
        uint256 optionAPrice,
        uint256 optionBPrice,
        uint256 volume,
        MarketStatus status
    ) private {
        require(
            bytes(externalMarkets[externalMarketId].marketName).length > 0, "Market does not exist"
        );
        ExternalMarket storage market = externalMarkets[externalMarketId];
        market.optionACurrentExternalPrice = optionAPrice;
        market.optionBCurrentExternalPrice = optionBPrice;
        market.volume = volume;
        market.lastCurrentPriceUpdate = block.timestamp;
        market.status = status;
        emit CurrentPricesUpdated(
            market.platform, // Platforms enum (indexed)
            externalMarketId, // string tickerHash (indexed, hashed)
            externalMarketId, // string ticker (readable)
            optionAPrice, // uint256 extPriceA
            optionBPrice // uint256 extPriceB
        );
    }

    /**
     * @notice Update fair prices for a market (called internally by _processReport)
     * @param externalMarketId The market to update
     * @param optionAFairPrice New fair price for option A
     * @param optionBFairPrice New fair price for option B
     */
    // TODO: Add authorization - whitelist Chainlink CRE nodes instead of onlyOwner
    function updateFairPrices(
        string memory externalMarketId,
        uint256 optionAFairPrice,
        uint256 optionBFairPrice
    ) public {
        require(
            bytes(externalMarkets[externalMarketId].marketName).length > 0, "Market does not exist"
        );
        ExternalMarket storage market = externalMarkets[externalMarketId];
        market.optionACurrentFairPrice = optionAFairPrice;
        market.optionBCurrentFairPrice = optionBFairPrice;
        market.lastFairPriceUpdate = block.timestamp;

        emit FairPricesUpdated(
            market.platform, // Platforms enum (indexed)
            externalMarketId, // string tickerHash (indexed, hashed)
            externalMarketId, // string ticker (readable)
            optionAFairPrice, // uint256 fairPriceA
            optionBFairPrice // uint256 fairPriceB
        );
    }

    /**
     * @notice Update market configuration
     * @param externalMarketId The market to update
     * @param minPriceDiff Minimum price difference to trigger action
     * @param maxSpend Maximum spend amount for this market
     * @param slippageBps Slippage tolerance in basis points
     */
    function updateMarketConfig(
        string memory externalMarketId,
        uint256 minPriceDiff,
        uint256 maxSpend,
        uint256 slippageBps
    ) public marketMustExist(externalMarketId) {
        MarketConfig storage config = marketConfigs[externalMarketId];
        config.minPriceDifference = minPriceDiff;
        config.maxSpendAmount = maxSpend;
        config.slippageToleranceBps = slippageBps;

        ExternalMarket memory market = externalMarkets[externalMarketId];
        emit MarketConfigUpdated(
            market.platform, // Platforms enum (indexed)
            externalMarketId, // string tickerHash (indexed, hashed)
            externalMarketId, // string ticker (readable)
            minPriceDiff, // uint256 minPriceDiff
            maxSpend, // uint256 maxSpend
            slippageBps // uint256 slippage
        );
    }

    /**
     * @notice Update market status
     * @param externalMarketId The market to update
     * @param newStatus The new market status
     */
    function updateMarketStatus(string memory externalMarketId, MarketStatus newStatus)
        public
        marketMustExist(externalMarketId)
    {
        ExternalMarket storage market = externalMarkets[externalMarketId];
        market.status = newStatus;
        emit MarketStatusUpdated(
            market.platform, // Platforms enum (indexed)
            externalMarketId, // string tickerHash (indexed, hashed)
            externalMarketId, // string ticker (readable)
            newStatus // MarketStatus newStatus
        );
    }

    /**
     * @notice Update default configuration
     * @param driftPercentage New default drift percentage
     * @param maxSpend New default max spend amount
     * @param slippageBps New default slippage tolerance
     */
    function updateDefaultConfig(uint256 driftPercentage, uint256 maxSpend, uint256 slippageBps)
        public
        onlyOwner
    {
        defaultConfig.driftPercentagePoints = driftPercentage;
        defaultConfig.maxSpendAmount = maxSpend;
        defaultConfig.slippageToleranceBps = slippageBps;

        emit DefaultConfigUpdated(driftPercentage, maxSpend, slippageBps);
    }

    /**
     * @notice Get market information
     * @param externalMarketId The market to query
     * @return market The complete market data
     */
    function getMarket(string memory externalMarketId)
        public
        view
        marketMustExist(externalMarketId)
        returns (ExternalMarket memory market)
    {
        return externalMarkets[externalMarketId];
    }

    /**
     * @notice Get all external market IDs
     * @return Array of all external market IDs
     */
    function getAllMarketIds() public view returns (string[] memory) {
        return externalMarketIds;
    }

    /**
     * @notice Check if price drift exceeds threshold for a market
     * @param externalMarketId The market to check
     * @return shouldBalance Whether price balancing should be triggered
     * @return driftA Price drift for option A (in basis points)
     * @return driftB Price drift for option B (in basis points)
     */
    function shouldBalancePrice(string memory externalMarketId)
        public
        view
        marketMustExist(externalMarketId)
        returns (bool shouldBalance, uint256 driftA, uint256 driftB)
    {
        ExternalMarket memory market = externalMarkets[externalMarketId];
        MarketConfig memory config = marketConfigs[externalMarketId];

        if (
            market.status != MarketStatus.Active || market.optionACurrentFairPrice == 0
                || market.optionBCurrentFairPrice == 0
        ) {
            return (false, 0, 0);
        }

        // Calculate drift as absolute percentage difference
        driftA = market.optionACurrentExternalPrice > market.optionACurrentFairPrice
            ? ((market.optionACurrentExternalPrice - market.optionACurrentFairPrice) * 10000)
                / market.optionACurrentFairPrice
            : ((market.optionACurrentFairPrice - market.optionACurrentExternalPrice) * 10000)
                / market.optionACurrentFairPrice;

        driftB = market.optionBCurrentExternalPrice > market.optionBCurrentFairPrice
            ? ((market.optionBCurrentExternalPrice - market.optionBCurrentFairPrice) * 10000)
                / market.optionBCurrentFairPrice
            : ((market.optionBCurrentFairPrice - market.optionBCurrentExternalPrice) * 10000)
                / market.optionBCurrentFairPrice;

        shouldBalance = driftA >= config.minPriceDifference || driftB >= config.minPriceDifference;
    }

    /**
     * @notice Implements the core business logic for processing reports.
     * @dev This is called automatically by IReceiverTemplate's onReport function after security checks.
     */
    function _processReport(bytes calldata report) internal override {
        // Decode the report bytes into our WorkflowResult struct
        WorkflowResult memory creWorkflowResult = abi.decode(report, (WorkflowResult));

        // // --- Core Logic ---
        // // Update contract state with the new result
        resultCount++;
        results[resultCount] = creWorkflowResult;
        latestResult = creWorkflowResult;

        // // Use ticker directly
        // string memory externalMarketId = creWorkflowResult.ticker;

        // Handle different workflow types
        bytes32 workflowNameHash = keccak256(abi.encodePacked(creWorkflowResult.workflowName));

        if (workflowNameHash == keccak256(abi.encodePacked("currentPriceFetch"))) {
            _updateExternalMarketData(
                creWorkflowResult.ticker,
                creWorkflowResult.optionAPrice,
                creWorkflowResult.optionBPrice,
                creWorkflowResult.volume,
                creWorkflowResult.status
            );
            emit WorkflowTriggered(creWorkflowResult.workflowName, resultCount, block.timestamp);
        } else if (workflowNameHash == keccak256(abi.encodePacked("fairPriceFetch"))) {
            updateFairPrices(
                creWorkflowResult.ticker,
                creWorkflowResult.optionAPrice,
                creWorkflowResult.optionBPrice
            );
        }
        // else if (workflowNameHash == keccak256(abi.encodePacked("marketStatusUp"))) {
        //     emit UnknownWorkflow(creWorkflowResult.workflowName);
        //     // revert UnknownWorkflow(creWorkflowResult.workflowName);
        // }

        emit ResultUpdated(creWorkflowResult.workflowName, resultCount, block.timestamp);
    }

    // This function is a "dry-run" utility. It allows an offchain system to check
    // if a prospective result is an outlier before submitting it for a real onchain update.
    // It is also used to guide the binding generator to create a method that accepts the WorkflowResult struct.
    function isResultAnomalous(WorkflowResult memory _prospectiveResult)
        public
        view
        returns (bool)
    {
        // A result is not considered anomalous if it's the first one.
        if (resultCount == 0) {
            return false;
        }

        // Business logic: Define an anomaly as a price change of more than 10x
        // This is just one example of a validation rule you could implement.
        return _prospectiveResult.optionAPrice > (latestResult.optionAPrice * 10)
            || _prospectiveResult.optionBPrice > (latestResult.optionBPrice * 10);
    }
}
