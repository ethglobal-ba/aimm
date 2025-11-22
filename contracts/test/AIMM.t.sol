// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {AIMM} from "../src/AIMM.sol";

contract AIMMTest is Test {
    AIMM public aimm;
    address public owner;
    address public user1;
    address public user2;

    // Default config values
    uint256 constant DEFAULT_DRIFT_PERCENTAGE = 500; // 5% in basis points
    uint256 constant DEFAULT_MAX_SPEND = 1000 ether;
    uint256 constant DEFAULT_SLIPPAGE_TOLERANCE = 100; // 1% in basis points

    // Test data
    string constant EXTERNAL_ID = "kalshi-123";
    string constant MARKET_NAME = "Trump 2024 Election";
    string constant OPTION_A = "Trump Wins";
    string constant OPTION_B = "Trump Loses";

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Deploy AIMM contract with default configuration
        aimm = new AIMM(DEFAULT_DRIFT_PERCENTAGE, DEFAULT_MAX_SPEND, DEFAULT_SLIPPAGE_TOLERANCE);
    }

    function test_Deployment() public {
        // Test that contract is deployed with correct default config
        (uint256 driftPercentage, uint256 maxSpend, uint256 slippageTolerance) =
            aimm.defaultConfig();

        assertEq(driftPercentage, DEFAULT_DRIFT_PERCENTAGE);
        assertEq(maxSpend, DEFAULT_MAX_SPEND);
        assertEq(slippageTolerance, DEFAULT_SLIPPAGE_TOLERANCE);
        assertEq(aimm.owner(), owner);
        assertEq(aimm.resultCount(), 0);
    }

    function test_OnboardMarket_Success() public {
        // Test successful market onboarding
        vm.expectEmit(true, true, false, true);
        emit AIMM.MarketOnboarded(
            "kalshi",
            EXTERNAL_ID,
            MARKET_NAME,
            "SUBTITLE123",
            "EVENT456",
            OPTION_A,
            OPTION_B,
            0,
            0,
            0
        );

        AIMM.OnboardMarketParams memory params = AIMM.OnboardMarketParams({
            externalMarketId: EXTERNAL_ID,
            platform: "kalshi",
            marketName: MARKET_NAME,
            subtitle: "SUBTITLE123",
            eventTicker: "EVENT456",
            optionAText: OPTION_A,
            optionBText: OPTION_B,
            optionACurrentExternalPrice: 0,
            optionBCurrentExternalPrice: 0,
            initialVolume: 0
        });
        aimm.onboardMarket(params);

        // Verify market was onboarded correctly
        AIMM.ExternalMarket memory market = aimm.getMarket(EXTERNAL_ID);
        assertEq(market.platform, "kalshi");
        assertEq(market.marketName, MARKET_NAME);
        assertEq(market.optionAText, OPTION_A);
        assertEq(market.optionBText, OPTION_B);
        assertEq(market.optionACurrentExternalPrice, 0);
        assertEq(market.optionBCurrentExternalPrice, 0);
        assertEq(uint256(market.status), uint256(AIMM.MarketStatus.Inactive));

        // Verify market configuration (stored separately)
        (uint256 minPriceDiff, uint256 maxSpend, uint256 slippageTolerance) =
            aimm.marketConfigs(EXTERNAL_ID);
        assertEq(minPriceDiff, DEFAULT_DRIFT_PERCENTAGE);
        assertEq(maxSpend, DEFAULT_MAX_SPEND);
        assertEq(slippageTolerance, DEFAULT_SLIPPAGE_TOLERANCE);

        // Check external market ID was added to array
        string[] memory marketIds = aimm.getAllMarketIds();
        assertEq(marketIds.length, 1);
        assertEq(marketIds[0], EXTERNAL_ID);
    }

    function test_OnboardMarket_OnlyOwner() public {
        // Test that only owner can onboard markets
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(0x118cdaa7, user1)); // OwnableUnauthorizedAccount selector
        AIMM.OnboardMarketParams memory params = AIMM.OnboardMarketParams({
            externalMarketId: EXTERNAL_ID,
            platform: "kalshi",
            marketName: MARKET_NAME,
            subtitle: "SUBTITLE789",
            eventTicker: "EVENT012",
            optionAText: OPTION_A,
            optionBText: OPTION_B,
            optionACurrentExternalPrice: 0,
            optionBCurrentExternalPrice: 0,
            initialVolume: 0
        });
        aimm.onboardMarket(params);
    }

    function test_OnboardMarket_RejectDuplicate() public {
        // Onboard market first time
        AIMM.OnboardMarketParams memory params = AIMM.OnboardMarketParams({
            externalMarketId: EXTERNAL_ID,
            platform: "kalshi",
            marketName: MARKET_NAME,
            subtitle: "SUBTITLE345",
            eventTicker: "EVENT678",
            optionAText: OPTION_A,
            optionBText: OPTION_B,
            optionACurrentExternalPrice: 0,
            optionBCurrentExternalPrice: 0,
            initialVolume: 0
        });
        aimm.onboardMarket(params);

        // Try to onboard same market again - should fail
        vm.expectRevert("Market already exists");
        aimm.onboardMarket(params);
    }

    function test_OnboardMarket_RejectEmptyParams() public {
        // Test rejection of empty external market ID
        vm.expectRevert("External market ID cannot be empty");
        AIMM.OnboardMarketParams memory emptyIdParams = AIMM.OnboardMarketParams({
            externalMarketId: "",
            platform: "kalshi",
            marketName: MARKET_NAME,
            subtitle: "SUBTITLE901",
            eventTicker: "EVENT234",
            optionAText: OPTION_A,
            optionBText: OPTION_B,
            optionACurrentExternalPrice: 0,
            optionBCurrentExternalPrice: 0,
            initialVolume: 0
        });
        aimm.onboardMarket(emptyIdParams);

        // Test rejection of empty market name
        vm.expectRevert("Market name cannot be empty");
        AIMM.OnboardMarketParams memory emptyNameParams = AIMM.OnboardMarketParams({
            externalMarketId: EXTERNAL_ID,
            platform: "kalshi",
            marketName: "",
            subtitle: "SUBTITLE567",
            eventTicker: "EVENT890",
            optionAText: OPTION_A,
            optionBText: OPTION_B,
            optionACurrentExternalPrice: 0,
            optionBCurrentExternalPrice: 0,
            initialVolume: 0
        });
        aimm.onboardMarket(emptyNameParams);
    }

    function test_UpdateMarketConfig() public {
        // Onboard market first
        AIMM.OnboardMarketParams memory params = AIMM.OnboardMarketParams({
            externalMarketId: EXTERNAL_ID,
            platform: "kalshi",
            marketName: MARKET_NAME,
            subtitle: "SUBTITLE135",
            eventTicker: "EVENT246",
            optionAText: OPTION_A,
            optionBText: OPTION_B,
            optionACurrentExternalPrice: 0,
            optionBCurrentExternalPrice: 0,
            initialVolume: 0
        });
        aimm.onboardMarket(params);

        uint256 newMinPriceDiff = 1000; // 10%
        uint256 newMaxSpend = 500 ether;
        uint256 newSlippage = 250; // 2.5%

        vm.expectEmit(true, true, false, true);
        emit AIMM.MarketConfigUpdated(
            "kalshi", EXTERNAL_ID, newMinPriceDiff, newMaxSpend, newSlippage
        );

        aimm.updateMarketConfig(EXTERNAL_ID, newMinPriceDiff, newMaxSpend, newSlippage);

        // Verify config was updated
        (uint256 minPriceDiff, uint256 maxSpend, uint256 slippageTolerance) =
            aimm.marketConfigs(EXTERNAL_ID);
        assertEq(minPriceDiff, newMinPriceDiff);
        assertEq(maxSpend, newMaxSpend);
        assertEq(slippageTolerance, newSlippage);
    }

    function test_UpdateMarketConfig_OnlyOwner() public {
        AIMM.OnboardMarketParams memory params = AIMM.OnboardMarketParams({
            externalMarketId: EXTERNAL_ID,
            platform: "kalshi",
            marketName: MARKET_NAME,
            subtitle: "SUBTITLE357",
            eventTicker: "EVENT468",
            optionAText: OPTION_A,
            optionBText: OPTION_B,
            optionACurrentExternalPrice: 0,
            optionBCurrentExternalPrice: 0,
            initialVolume: 0
        });
        aimm.onboardMarket(params);

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(0x118cdaa7, user1)); // OwnableUnauthorizedAccount selector
        aimm.updateMarketConfig(EXTERNAL_ID, 1000, 500 ether, 250);
    }

    function test_UpdateMarketConfig_MarketMustExist() public {
        vm.expectRevert("Market does not exist");
        aimm.updateMarketConfig("nonexistent", 1000, 500 ether, 250);
    }

    function test_SetMarketStatus() public {
        AIMM.OnboardMarketParams memory params = AIMM.OnboardMarketParams({
            externalMarketId: EXTERNAL_ID,
            platform: "kalshi",
            marketName: MARKET_NAME,
            subtitle: "SUBTITLE579",
            eventTicker: "EVENT680",
            optionAText: OPTION_A,
            optionBText: OPTION_B,
            optionACurrentExternalPrice: 0,
            optionBCurrentExternalPrice: 0,
            initialVolume: 0
        });
        aimm.onboardMarket(params);

        vm.expectEmit(true, true, false, true);
        emit AIMM.MarketStatusUpdated("kalshi", EXTERNAL_ID, AIMM.MarketStatus.ClosedInternal);

        aimm.updateMarketStatus(EXTERNAL_ID, AIMM.MarketStatus.ClosedInternal);

        AIMM.ExternalMarket memory market = aimm.getMarket(EXTERNAL_ID);
        assertEq(uint256(market.status), uint256(AIMM.MarketStatus.ClosedInternal));
    }

    function test_UpdateDefaultConfig() public {
        uint256 newDrift = 750; // 7.5%
        uint256 newMaxSpend = 2000 ether;
        uint256 newSlippage = 300; // 3%

        vm.expectEmit(false, false, false, true);
        emit AIMM.DefaultConfigUpdated(newDrift, newMaxSpend, newSlippage);

        aimm.updateDefaultConfig(newDrift, newMaxSpend, newSlippage);

        (uint256 driftPercentage, uint256 maxSpend, uint256 slippageTolerance) =
            aimm.defaultConfig();
        assertEq(driftPercentage, newDrift);
        assertEq(maxSpend, newMaxSpend);
        assertEq(slippageTolerance, newSlippage);
    }

    function test_ProcessReport_CurrentPriceFetch() public {
        AIMM.OnboardMarketParams memory params = AIMM.OnboardMarketParams({
            externalMarketId: EXTERNAL_ID,
            platform: "kalshi",
            marketName: MARKET_NAME,
            subtitle: "SUBTITLE791",
            eventTicker: "EVENT802",
            optionAText: OPTION_A,
            optionBText: OPTION_B,
            optionACurrentExternalPrice: 0,
            optionBCurrentExternalPrice: 0,
            initialVolume: 0
        });
        aimm.onboardMarket(params);

        // Create workflow result for current price fetch
        AIMM.WorkflowResult memory result = AIMM.WorkflowResult({
            workflowName: "currentPriceFetch",
            platform: "kalshi",
            externalMarketId: EXTERNAL_ID,
            optionAPrice: 60 * 1e18, // 60% in wei
            optionBPrice: 40 * 1e18, // 40% in wei
            volume: 100,
            status: AIMM.MarketStatus.Active
        });

        bytes memory report = abi.encode(result);
        bytes memory metadata = abi.encodePacked(
            bytes32("workflow123"), // workflowId
            bytes10("test12345"), // workflowName
            owner // workflowOwner
        );

        vm.expectEmit(true, true, false, true);
        emit AIMM.CurrentPricesUpdated(
            "kalshi", EXTERNAL_ID, result.optionAPrice, result.optionBPrice
        );

        vm.expectEmit(true, false, false, true);
        emit AIMM.ResultUpdated(1, block.timestamp);

        aimm.onReport(metadata, report);

        // Verify result was stored
        assertEq(aimm.resultCount(), 1);
        (
            string memory workflowName,
            string memory platform,
            string memory externalMarketId,
            uint256 optionAPrice,
            uint256 optionBPrice,
            uint256 volume,
            AIMM.MarketStatus status
        ) = aimm.results(1);
        assertEq(optionAPrice, result.optionAPrice);
        assertEq(optionBPrice, result.optionBPrice);
        assertEq(
            keccak256(abi.encodePacked(workflowName)),
            keccak256(abi.encodePacked("currentPriceFetch"))
        );

        // Verify external prices were updated
        AIMM.ExternalMarket memory market = aimm.getMarket(EXTERNAL_ID);
        assertEq(market.optionACurrentExternalPrice, result.optionAPrice);
        assertEq(market.optionBCurrentExternalPrice, result.optionBPrice);
    }

    function test_ProcessReport_FairPriceFetch() public {
        AIMM.OnboardMarketParams memory params = AIMM.OnboardMarketParams({
            externalMarketId: EXTERNAL_ID,
            platform: "kalshi",
            marketName: MARKET_NAME,
            subtitle: "SUBTITLE913",
            eventTicker: "EVENT024",
            optionAText: OPTION_A,
            optionBText: OPTION_B,
            optionACurrentExternalPrice: 0,
            optionBCurrentExternalPrice: 0,
            initialVolume: 0
        });
        aimm.onboardMarket(params);

        AIMM.WorkflowResult memory result = AIMM.WorkflowResult({
            workflowName: "fairPriceFetch",
            platform: "kalshi",
            externalMarketId: EXTERNAL_ID,
            optionAPrice: 55 * 1e18, // 55% fair price
            optionBPrice: 45 * 1e18, // 45% fair price
            volume: 100,
            status: AIMM.MarketStatus.Active
        });

        bytes memory report = abi.encode(result);
        bytes memory metadata =
            abi.encodePacked(bytes32("workflow123"), bytes10("test12345"), owner);

        vm.expectEmit(true, true, false, true);
        emit AIMM.FairPricesUpdated("kalshi", EXTERNAL_ID, result.optionAPrice, result.optionBPrice);

        aimm.onReport(metadata, report);

        // Verify fair prices were updated
        AIMM.ExternalMarket memory market = aimm.getMarket(EXTERNAL_ID);
        assertEq(market.optionACurrentFairPrice, result.optionAPrice);
        assertEq(market.optionBCurrentFairPrice, result.optionBPrice);
    }

    function test_ProcessReport_CloseMarket() public {
        AIMM.OnboardMarketParams memory params = AIMM.OnboardMarketParams({
            externalMarketId: EXTERNAL_ID,
            platform: "kalshi",
            marketName: MARKET_NAME,
            subtitle: "SUBTITLE135",
            eventTicker: "EVENT246",
            optionAText: OPTION_A,
            optionBText: OPTION_B,
            optionACurrentExternalPrice: 0,
            optionBCurrentExternalPrice: 0,
            initialVolume: 0
        });
        aimm.onboardMarket(params);

        AIMM.WorkflowResult memory result = AIMM.WorkflowResult({
            workflowName: "closeMarket",
            platform: "kalshi",
            externalMarketId: EXTERNAL_ID,
            optionAPrice: 0,
            optionBPrice: 0,
            volume: 0,
            status: AIMM.MarketStatus.Active
        });

        bytes memory report = abi.encode(result);
        bytes memory metadata =
            abi.encodePacked(bytes32("workflow123"), bytes10("test12345"), owner);

        vm.expectEmit(true, true, false, true);
        emit AIMM.MarketStatusChanged("kalshi", EXTERNAL_ID, AIMM.MarketStatus.ClosedExternal);

        aimm.onReport(metadata, report);

        // Verify market was closed
        AIMM.ExternalMarket memory market = aimm.getMarket(EXTERNAL_ID);
        assertEq(uint256(market.status), uint256(AIMM.MarketStatus.ClosedExternal));
    }

    function test_ShouldBalancePrice() public {
        AIMM.OnboardMarketParams memory params = AIMM.OnboardMarketParams({
            externalMarketId: EXTERNAL_ID,
            platform: "kalshi",
            marketName: MARKET_NAME,
            subtitle: "SUBTITLE357",
            eventTicker: "EVENT468",
            optionAText: OPTION_A,
            optionBText: OPTION_B,
            optionACurrentExternalPrice: 0,
            optionBCurrentExternalPrice: 0,
            initialVolume: 0
        });
        aimm.onboardMarket(params);

        // Activate the market for testing
        aimm.updateMarketStatus(EXTERNAL_ID, AIMM.MarketStatus.Active);

        // Set external prices to 60/40
        _updateExternalPrices(60 * 1e18, 40 * 1e18);

        // Set fair prices to 55/45 - should trigger balance (drift > 5%)
        _updateFairPrices(55 * 1e18, 45 * 1e18);

        (bool shouldBalance, uint256 driftA, uint256 driftB) = aimm.shouldBalancePrice(EXTERNAL_ID);

        assertTrue(shouldBalance);
        // Option A drift: (60-55)/55 * 10000 = 909 basis points (~9.09%)
        assertApproxEqRel(driftA, 909, 0.1e18); // 10% tolerance for rounding
        // Option B drift: (45-40)/40 * 10000 = 1250 basis points (12.5%)
        assertApproxEqRel(driftB, 1111, 0.1e18); // Corrected calculation: (45-40)/45 * 10000
    }

    function test_ShouldBalancePrice_InactiveMarket() public {
        AIMM.OnboardMarketParams memory params = AIMM.OnboardMarketParams({
            externalMarketId: EXTERNAL_ID,
            platform: "kalshi",
            marketName: MARKET_NAME,
            subtitle: "SUBTITLE579",
            eventTicker: "EVENT680",
            optionAText: OPTION_A,
            optionBText: OPTION_B,
            optionACurrentExternalPrice: 0,
            optionBCurrentExternalPrice: 0,
            initialVolume: 0
        });
        aimm.onboardMarket(params);
        aimm.updateMarketStatus(EXTERNAL_ID, AIMM.MarketStatus.ClosedInternal);

        _updateExternalPrices(60 * 1e18, 40 * 1e18);
        _updateFairPrices(50 * 1e18, 50 * 1e18);

        (bool shouldBalance, uint256 driftA, uint256 driftB) = aimm.shouldBalancePrice(EXTERNAL_ID);

        assertFalse(shouldBalance);
        assertEq(driftA, 0);
        assertEq(driftB, 0);
    }

    function test_IsResultAnomalous() public {
        // First result should not be anomalous
        AIMM.WorkflowResult memory firstResult = AIMM.WorkflowResult({
            workflowName: "test",
            platform: "kalshi",
            externalMarketId: EXTERNAL_ID,
            optionAPrice: 50 * 1e18,
            optionBPrice: 50 * 1e18,
            volume: 100,
            status: AIMM.MarketStatus.Active
        });

        assertFalse(aimm.isResultAnomalous(firstResult));

        // Submit first result
        AIMM.OnboardMarketParams memory params = AIMM.OnboardMarketParams({
            externalMarketId: EXTERNAL_ID,
            platform: "kalshi",
            marketName: MARKET_NAME,
            subtitle: "SUBTITLE791",
            eventTicker: "EVENT802",
            optionAText: OPTION_A,
            optionBText: OPTION_B,
            optionACurrentExternalPrice: 0,
            optionBCurrentExternalPrice: 0,
            initialVolume: 0
        });
        aimm.onboardMarket(params);
        _processReport(firstResult);

        // Normal result (not anomalous)
        AIMM.WorkflowResult memory normalResult = firstResult;
        normalResult.optionAPrice = 75 * 1e18; // 1.5x the previous result
        assertFalse(aimm.isResultAnomalous(normalResult));

        // Anomalous result (more than 10x previous)
        AIMM.WorkflowResult memory anomalousResult = firstResult;
        anomalousResult.optionAPrice = 550 * 1e18; // 11x the previous result
        assertTrue(aimm.isResultAnomalous(anomalousResult));
    }

    // Helper functions
    function _updateExternalPrices(uint256 priceA, uint256 priceB) internal {
        AIMM.WorkflowResult memory result = AIMM.WorkflowResult({
            workflowName: "currentPriceFetch",
            platform: "kalshi",
            externalMarketId: EXTERNAL_ID,
            optionAPrice: priceA,
            optionBPrice: priceB,
            volume: 100,
            status: AIMM.MarketStatus.Active
        });
        _processReport(result);
    }

    function _updateFairPrices(uint256 priceA, uint256 priceB) internal {
        AIMM.WorkflowResult memory result = AIMM.WorkflowResult({
            workflowName: "fairPriceFetch",
            platform: "kalshi",
            externalMarketId: EXTERNAL_ID,
            optionAPrice: priceA,
            optionBPrice: priceB,
            volume: 100,
            status: AIMM.MarketStatus.Active
        });
        _processReport(result);
    }

    function _processReport(AIMM.WorkflowResult memory result) internal {
        bytes memory report = abi.encode(result);
        bytes memory metadata =
            abi.encodePacked(bytes32("workflow123"), bytes10("test12345"), owner);
        aimm.onReport(metadata, report);
    }
}
