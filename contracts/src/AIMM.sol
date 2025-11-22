// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

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

    struct WorkflowResult {
        string workflowName; // currentPriceFetch, fairPriceFetch, closeMarket
        string platform; // Platform name (e.g., "kalshi") used to calculate market ID
        string externalMarketId; // External market ID used to calculate market ID
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

    // Input parameters for onboarding a market
    struct OnboardMarketParams {
        string externalMarketId;
        string platform;
        string marketName;
        string optionAText;
        string optionBText;
        uint256 optionACurrentExternalPrice;
        uint256 optionBCurrentExternalPrice;
        uint256 initialVolume;
    }

    // Configuration and data for each external market
    struct ExternalMarket {
        string platform; // Platform name (e.g., "kalshi", "polymarket")
        string marketName; // Human readable market name
        string optionAText; // Description of option A
        string optionBText; // Description of option B
        uint256 optionACurrentExternalPrice; // Current price on external market
        uint256 optionBCurrentExternalPrice; // Current price on external market
        uint256 optionACurrentFairPrice; // Current fair price (internal)
        uint256 optionBCurrentFairPrice; // Current fair price (internal)
        uint256 lastCurrentPriceUpdate; // Timestamp of last current price update
        uint256 lastFairPriceUpdate; // Timestamp of last fair price update
        uint256 volume; // Trading volume for this market
        uint256 minPriceDifference; // Minimum price difference to trigger action
        uint256 maxSpendAmount; // Max amount allowed to spend for this market
        uint256 slippageToleranceBps; // Slippage tolerance for this market
        MarketStatus status;
    }

    error MarketNotOpen(string marketId);
    error MarketAlreadyExists(string marketId);

    // --- State Variables ---
    WorkflowResult public latestResult;
    uint256 public resultCount;

    mapping(uint256 => WorkflowResult) public results;

    // Market management state
    DefaultConfig public defaultConfig;
    mapping(string => ExternalMarket) public externalMarkets;
    string[] public externalMarketIds;

    // --- Events ---
    event ResultUpdated(uint256 indexed resultId, uint256 finalResult);
    event MarketOnboarded(
        string indexed platform,
        string indexed externalMarketId,
        string marketName,
        string optionA,
        string optionB
    );
    event MarketConfigUpdated(
        string indexed platform,
        string indexed externalMarketId,
        uint256 minPriceDiff,
        uint256 maxSpend,
        uint256 slippage
    );
    event CurrentPricesUpdated(
        string indexed platform,
        string indexed externalMarketId,
        uint256 extPriceA,
        uint256 extPriceB
    );
    event FairPricesUpdated(
        string indexed platform,
        string indexed externalMarketId,
        uint256 fairPriceA,
        uint256 fairPriceB
    );
    event MarketStatusChanged(
        string indexed platform, string indexed externalMarketId, MarketStatus newStatus
    );
    event MarketStatusUpdated(
        string indexed platform, string indexed externalMarketId, MarketStatus newStatus
    );
    event DefaultConfigUpdated(uint256 driftPercentage, uint256 maxSpend, uint256 slippage);

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
            bytes(externalMarkets[externalMarketId].platform).length == 0, "Market already exists"
        );
        _;
    }

    modifier marketMustExist(string memory externalMarketId) {
        require(
            bytes(externalMarkets[externalMarketId].platform).length > 0, "Market does not exist"
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
        marketNotExists(params.externalMarketId)
    {
        require(bytes(params.externalMarketId).length > 0, "External market ID cannot be empty");
        require(bytes(params.marketName).length > 0, "Market name cannot be empty");

        externalMarkets[params.externalMarketId] = ExternalMarket({
            platform: params.platform,
            marketName: params.marketName,
            optionAText: params.optionAText,
            optionBText: params.optionBText,
            optionACurrentExternalPrice: params.optionACurrentExternalPrice,
            optionBCurrentExternalPrice: params.optionBCurrentExternalPrice,
            optionACurrentFairPrice: 0,
            optionBCurrentFairPrice: 0,
            lastCurrentPriceUpdate: 0,
            lastFairPriceUpdate: 0,
            volume: params.initialVolume,
            minPriceDifference: defaultConfig.driftPercentagePoints,
            maxSpendAmount: defaultConfig.maxSpendAmount,
            slippageToleranceBps: defaultConfig.slippageToleranceBps,
            status: MarketStatus.Inactive
        });

        externalMarketIds.push(params.externalMarketId);

        emit MarketOnboarded(
            params.platform,
            params.externalMarketId,
            params.marketName,
            params.optionAText,
            params.optionBText
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
            bytes(externalMarkets[externalMarketId].platform).length > 0, "Market does not exist"
        );
        ExternalMarket storage market = externalMarkets[externalMarketId];
        market.optionACurrentExternalPrice = optionAPrice;
        market.optionBCurrentExternalPrice = optionBPrice;
        market.volume = volume;
        market.lastCurrentPriceUpdate = block.timestamp;

        emit CurrentPricesUpdated(market.platform, externalMarketId, optionAPrice, optionBPrice);
    }

    /**
     * @notice Update fair prices for a market (called internally by _processReport)
     * @param externalMarketId The market to update
     * @param optionAFairPrice New fair price for option A
     * @param optionBFairPrice New fair price for option B
     */
    function _updateFairPrices(
        string memory externalMarketId,
        uint256 optionAFairPrice,
        uint256 optionBFairPrice
    ) private {
        require(
            bytes(externalMarkets[externalMarketId].platform).length > 0, "Market does not exist"
        );
        ExternalMarket storage market = externalMarkets[externalMarketId];
        market.optionACurrentFairPrice = optionAFairPrice;
        market.optionBCurrentFairPrice = optionBFairPrice;
        market.lastFairPriceUpdate = block.timestamp;

        emit FairPricesUpdated(
            market.platform, externalMarketId, optionAFairPrice, optionBFairPrice
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
    ) public onlyOwner marketMustExist(externalMarketId) {
        ExternalMarket storage market = externalMarkets[externalMarketId];
        market.minPriceDifference = minPriceDiff;
        market.maxSpendAmount = maxSpend;
        market.slippageToleranceBps = slippageBps;

        emit MarketConfigUpdated(
            market.platform, externalMarketId, minPriceDiff, maxSpend, slippageBps
        );
    }

    /**
     * @notice Update market status
     * @param externalMarketId The market to update
     * @param newStatus The new market status
     */
    function updateMarketStatus(string memory externalMarketId, MarketStatus newStatus)
        public
        onlyOwner
        marketMustExist(externalMarketId)
    {
        ExternalMarket storage market = externalMarkets[externalMarketId];
        market.status = newStatus;
    emit MarketStatusUpdated(market.platform, externalMarketId, newStatus);
    }

    /**
     * @notice Change market status (emits MarketStatusUpdated event)
     * @param externalMarketId The market to update
     * @param newStatus The new market status
     */
    function changeMarketStatus(string memory externalMarketId, MarketStatus newStatus)
        public
        onlyOwner
        marketMustExist(externalMarketId)
    {
        ExternalMarket storage market = externalMarkets[externalMarketId];
        market.status = newStatus;
        emit MarketStatusUpdated(market.platform, externalMarketId, newStatus);
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

        shouldBalance = driftA >= market.minPriceDifference || driftB >= market.minPriceDifference;
    }

    /**
     * @notice Implements the core business logic for processing reports.
     * @dev This is called automatically by IReceiverTemplate's onReport function after security checks.
     */
    function _processReport(bytes calldata report) internal override {
        // Decode the report bytes into our WorkflowResult struct
        WorkflowResult memory calculatorResult = abi.decode(report, (WorkflowResult));

        // --- Core Logic ---
        // Update contract state with the new result
        resultCount++;
        results[resultCount] = calculatorResult;
        latestResult = calculatorResult;

        // Use externalMarketId directly
        string memory externalMarketId = calculatorResult.externalMarketId;

        // Handle different workflow types
        bytes32 workflowNameHash = keccak256(abi.encodePacked(calculatorResult.workflowName));

        if (workflowNameHash == keccak256(abi.encodePacked("currentPriceFetch"))) {
            _updateExternalMarketData(
                externalMarketId,
                calculatorResult.optionAPrice,
                calculatorResult.optionBPrice,
                calculatorResult.volume,
                calculatorResult.status
            );
        } else if (workflowNameHash == keccak256(abi.encodePacked("fairPriceFetch"))) {
            _updateFairPrices(
                externalMarketId, calculatorResult.optionAPrice, calculatorResult.optionBPrice
            );
        } else if (workflowNameHash == keccak256(abi.encodePacked("closeMarket"))) {
            _closeMarket(externalMarketId);
        }

        emit ResultUpdated(resultCount, block.timestamp);
    }

    /**
     * @notice Close a market (internal helper)
     */
    function _closeMarket(string memory externalMarketId) private {
        if (bytes(externalMarkets[externalMarketId].platform).length > 0) {
            ExternalMarket storage market = externalMarkets[externalMarketId];
            market.status = MarketStatus.ClosedExternal;
            emit MarketStatusChanged(market.platform, externalMarketId, MarketStatus.ClosedExternal);
        }
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
