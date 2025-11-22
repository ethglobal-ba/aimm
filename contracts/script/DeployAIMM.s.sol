// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {AIMM} from "../src/AIMM.sol";

/**
 * @title DeployAIMM
 * @notice Script to deploy the AIMM (Automated Intelligent Market Maker) contract
 * @dev Run with: forge script script/DeployAIMM.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
 */
contract DeployAIMM is Script {
    // Default configuration values (can be overridden via environment variables)
    uint256 public constant DEFAULT_DRIFT_PERCENTAGE_POINTS = 500; // 5% drift trigger (500 basis points)
    uint256 public constant DEFAULT_MAX_SPEND_AMOUNT = 10 ether; // 10 ETH max spend per rebalancing
    uint256 public constant DEFAULT_SLIPPAGE_TOLERANCE_BPS = 100; // 1% slippage tolerance (100 basis points)

    function run() public returns (AIMM aimm) {
        // Read configuration from environment variables (with fallbacks)
        uint256 driftPercentagePoints = vm.envOr("AIMM_DRIFT_PERCENTAGE", DEFAULT_DRIFT_PERCENTAGE_POINTS);
        uint256 maxSpendAmount = vm.envOr("AIMM_MAX_SPEND_AMOUNT", DEFAULT_MAX_SPEND_AMOUNT);
        uint256 slippageToleranceBps = vm.envOr("AIMM_SLIPPAGE_TOLERANCE", DEFAULT_SLIPPAGE_TOLERANCE_BPS);

        console.log("Deploying AIMM with configuration:");
        console.log("  Drift Percentage Points:", driftPercentagePoints);
        console.log("  Max Spend Amount:", maxSpendAmount);
        console.log("  Slippage Tolerance (BPS):", slippageToleranceBps);

        // Start broadcasting transactions
        vm.startBroadcast();

        // Deploy AIMM contract
        aimm = new AIMM(driftPercentagePoints, maxSpendAmount, slippageToleranceBps);

        vm.stopBroadcast();

        console.log("AIMM deployed at:", address(aimm));
        console.log("Owner:", aimm.owner());

        // Verify deployment first with original config
        _verifyDeployment(aimm, driftPercentagePoints, maxSpendAmount, slippageToleranceBps);

        // Then emit all event types for indexer verification
        vm.startBroadcast();
        _emitAllEventTypes(aimm);
        vm.stopBroadcast();

        return aimm;
    }

    /**
     * @notice Verify the deployment was successful and configuration is correct
     */
    function _verifyDeployment(
        AIMM aimm,
        uint256 expectedDrift,
        uint256 expectedMaxSpend,
        uint256 expectedSlippage
    ) internal view {
        console.log("\n=== Deployment Verification ===");

        // Verify contract was deployed
        require(address(aimm) != address(0), "AIMM deployment failed");
        console.log("[OK] Contract deployed successfully");

        // Verify owner
        require(aimm.owner() == msg.sender, "Owner not set correctly");
        console.log("[OK] Owner set correctly:", aimm.owner());

        // Verify default configuration
        (uint256 driftPercentage, uint256 maxSpend, uint256 slippage) = aimm.defaultConfig();

        require(driftPercentage == expectedDrift, "Drift percentage not set correctly");
        console.log("[OK] Drift percentage set correctly:", driftPercentage);

        require(maxSpend == expectedMaxSpend, "Max spend amount not set correctly");
        console.log("[OK] Max spend amount set correctly:", maxSpend);

        require(slippage == expectedSlippage, "Slippage tolerance not set correctly");
        console.log("[OK] Slippage tolerance set correctly:", slippage);

        // Verify initial state
        require(aimm.resultCount() == 0, "Result count should be 0 initially");
        console.log("[OK] Initial result count is 0");

        string[] memory marketIds = aimm.getAllMarketIds();
        require(marketIds.length == 0, "Market IDs array should be empty initially");
        console.log("[OK] No markets onboarded initially");

        console.log("[OK] All deployment verifications passed!");
    }

    /**
     * @notice Deploy AIMM with custom parameters (useful for testing different configurations)
     */
    function deployWithCustomConfig(
        uint256 driftPercentagePoints,
        uint256 maxSpendAmount,
        uint256 slippageToleranceBps
    ) public returns (AIMM aimm) {
        console.log("Deploying AIMM with custom configuration:");
        console.log("  Drift Percentage Points:", driftPercentagePoints);
        console.log("  Max Spend Amount:", maxSpendAmount);
        console.log("  Slippage Tolerance (BPS):", slippageToleranceBps);

        vm.startBroadcast();
        aimm = new AIMM(driftPercentagePoints, maxSpendAmount, slippageToleranceBps);
        vm.stopBroadcast();

        console.log("AIMM deployed at:", address(aimm));
        _verifyDeployment(aimm, driftPercentagePoints, maxSpendAmount, slippageToleranceBps);

        return aimm;
    }

    /**
     * @notice Deploy AIMM for testnet with lower values
     */
    function deployForTestnet() public returns (AIMM aimm) {
        return deployWithCustomConfig(
            10, // 0.1% drift (more sensitive for testing)
            1 ether, // 1 ETH max spend (lower for testnet)
            200 // 2% slippage (higher tolerance for testnet)
        );
    }

    /**
     * @notice Deploy AIMM for mainnet with conservative values
     */
    function deployForMainnet() public returns (AIMM aimm) {
        return deployWithCustomConfig(
            250, // 2.5% drift (more conservative)
            50 ether, // 50 ETH max spend (higher for mainnet)
            50 // 0.5% slippage (tighter for mainnet)
        );
    }

    /**
     * @notice Onboard Kalshi prediction markets to the AIMM contract
     * @param aimm The deployed AIMM contract instance
     */
    function onboardKalshiMarkets(AIMM aimm) public {
        console.log("\n=== Onboarding Kalshi Markets ===");
        
        vm.startBroadcast();

        // 1. Egypt President Market - Abdel Fattah el-Sisi
        // FIXED: Ensuring correct parameter mapping
        aimm.onboardMarket(AIMM.OnboardMarketParams({
            externalMarketId: "KXAFRICALEADEROUT-35-AFES", // Kalshi ticker - this is what we'll use for API calls
            platform: "kalshi", // Platform name
            marketName: "Will Abdel Fattah el-Sisi leave office next in this set?", // marketName
            optionAText: "Yes - Abdel Fattah el-Sisi leaves office first", // optionAText
            optionBText: "No - Abdel Fattah el-Sisi does not leave office first", // optionBText
            optionACurrentExternalPrice: 8000000, // yes_ask: 8 cents = 0.080000 with 6 decimals
            optionBCurrentExternalPrice: 92000000, // no_bid: 92 cents = 0.920000 with 6 decimals
            initialVolume: 22000000000000000000 // volume: 22 from Kalshi data
        }));
        console.log("Onboarded: Egypt President Market");

        // 2. Miami Vice Actor Market - Pedro Pascal
        aimm.onboardMarket(AIMM.OnboardMarketParams({
            externalMarketId: "KXACTORSONNYCROCKETT-35-PED",
            platform: "kalshi", // platform
            marketName: "Will Pedro Pascal be casted in the next Miami Vice?",
            optionAText: "Yes - Pedro Pascal is cast",
            optionBText: "No - Pedro Pascal is not cast",
            optionACurrentExternalPrice: 11000000, // yes_ask: 11 cents = 0.110000 with 6 decimals
            optionBCurrentExternalPrice: 89000000, // no_bid: 89 cents = 0.890000 with 6 decimals
            initialVolume: 0 // volume: 0 from Kalshi data
        }));
        console.log("Onboarded: Pedro Pascal Miami Vice Market");

        // 3. James Bond Song Market - Ariana Grande
        aimm.onboardMarket(AIMM.OnboardMarketParams({
            externalMarketId: "KXPERFORMBONDSONG-35-ARI",
            platform: "kalshi", // platform
            marketName: "Who will perform the next James Bond Song?",
            optionAText: "Yes - Ariana Grande performs",
            optionBText: "No - Ariana Grande does not perform",
            optionACurrentExternalPrice: 12000000, // yes_ask: 12 cents = 0.120000 with 6 decimals
            optionBCurrentExternalPrice: 96000000, // no_bid: 96 cents = 0.960000 with 6 decimals
            initialVolume: 52000000000000000000 // volume: 52 from Kalshi data
        }));
        console.log("Onboarded: Ariana Grande Bond Song Market");

        // 4. Next Pope Market - Pietro Parolin
        aimm.onboardMarket(AIMM.OnboardMarketParams({
            externalMarketId: "KXNEWPOPE-35-PPAR",
            platform: "kalshi", // platform
            marketName: "Who will the next Pope be?",
            optionAText: "Yes - Pietro Parolin becomes Pope",
            optionBText: "No - Pietro Parolin does not become Pope",
            optionACurrentExternalPrice: 10000000, // yes_ask: 10 cents = 0.100000 with 6 decimals
            optionBCurrentExternalPrice: 90000000, // no_bid: 90 cents = 0.900000 with 6 decimals
            initialVolume: 504000000000000000000 // volume: 504 from Kalshi data
        }));
        console.log("Onboarded: Pietro Parolin Pope Market");

        // 5. Next Pope Market - Peter Erdo
        aimm.onboardMarket(AIMM.OnboardMarketParams({
            externalMarketId: "KXNEWPOPE-35-PERD",
            platform: "kalshi", // platform
            marketName: "Who will the next Pope be?",
            optionAText: "Yes - Peter Erdo becomes Pope",
            optionBText: "No - Peter Erdo does not become Pope",
            optionACurrentExternalPrice: 3000000, // yes_ask: 3 cents = 0.030000 with 6 decimals
            optionBCurrentExternalPrice: 97000000, // no_bid: 97 cents = 0.970000 with 6 decimals
            initialVolume: 551000000000000000000 // volume: 551 from Kalshi data
        }));
        console.log("Onboarded: Peter Erdo Pope Market");

        vm.stopBroadcast();

        console.log("=== Kalshi Markets Onboarded Successfully ===");
        string[] memory marketIds = aimm.getAllMarketIds();
        console.log("Total markets onboarded:", marketIds.length);
        
        // VERIFICATION: Check that markets are stored correctly
        _verifyMarketsOnboarded(aimm, marketIds);
    }

    /**
     * @notice Verify that markets were onboarded with correct field mapping
     */
    function _verifyMarketsOnboarded(AIMM aimm, string[] memory marketIds) internal view {
        console.log("\n=== Verifying Market Field Mapping ===");
        
        for (uint i = 0; i < marketIds.length && i < 2; i++) {
            string memory marketId = marketIds[i];
            console.log("Checking market ID:", marketId);
            
            try aimm.getMarket(marketId) returns (AIMM.ExternalMarket memory market) {
                console.log("  External Market ID (key):", marketId);
                console.log("  Platform (should be 'kalshi'):", market.platform);
                console.log("  Market Name:", market.marketName);
                
                // Verify this is correct: platform should be "kalshi", marketId should be ticker
                if (keccak256(abi.encodePacked(market.platform)) != keccak256(abi.encodePacked("kalshi"))) {
                    console.log("  [WARNING] Platform is not 'kalshi', found:", market.platform);
                    console.log("  [WARNING] This suggests parameter swapping occurred!");
                }
                
                // Check if marketId looks like a Kalshi ticker (starts with 'KX')
                if (bytes(marketId).length > 2) {
                    if (bytes(marketId)[0] == 'K' && bytes(marketId)[1] == 'X') {
                        console.log("  [OK] Market ID looks like valid Kalshi ticker");
                    } else {
                        console.log("  [WARNING] Market ID does not look like Kalshi ticker");
                    }
                }
            } catch {
                console.log("  [ERROR] Could not read market data");
            }
        }
    }

    /**
     * @notice Emit one of each event type for indexer verification
     * @param aimm The deployed AIMM contract instance
     */
    function _emitAllEventTypes(AIMM aimm) internal {
        console.log("\n=== Emitting All Event Types for Indexer Verification ===");

        // 1. MarketOnboarded - Onboard a test market
        console.log("Emitting MarketOnboarded event...");
        aimm.onboardMarket(AIMM.OnboardMarketParams({
            externalMarketId: "TEST-MARKET-001",
            platform: "test",
            marketName: "Test Market for Verification",
            optionAText: "Option A",
            optionBText: "Option B",
            optionACurrentExternalPrice: 50000000, // 50 cents
            optionBCurrentExternalPrice: 50000000, // 50 cents
            initialVolume: 1000000000000000000 // 1 ETH volume
        }));

        // 2. MarketConfigUpdated - Update the test market config
        console.log("Emitting MarketConfigUpdated event...");
        aimm.updateMarketConfig(
            "TEST-MARKET-001",
            600, // 6% min price difference
            20 ether, // 20 ETH max spend
            150 // 1.5% slippage
        );

        // 3. MarketStatusChanged - Change the test market status
        console.log("Emitting MarketStatusChanged event...");
        aimm.updateMarketStatus("TEST-MARKET-001", AIMM.MarketStatus.ClosedInternal);

        // 4. DefaultConfigUpdated - Update default configuration
        console.log("Emitting DefaultConfigUpdated event...");
        aimm.updateDefaultConfig(
            700, // 7% drift percentage
            25 ether, // 25 ETH max spend
            200 // 2% slippage
        );

        // 5. CurrentPricesUpdated & 6. FairPricesUpdated & 7. ResultUpdated
        // These are emitted by calling the receiver template with mock data
        console.log("Emitting CurrentPricesUpdated, FairPricesUpdated, and ResultUpdated events...");

        // Create a mock WorkflowResult for current prices
        AIMM.WorkflowResult memory currentPriceResult = AIMM.WorkflowResult({
            workflowName: "currentPriceFetch",
            platform: "test",
            externalMarketId: "TEST-MARKET-001",
            optionAPrice: 60000000, // 60 cents
            optionBPrice: 40000000, // 40 cents
            volume: 2000000000000000000, // 2 ETH volume
            status: AIMM.MarketStatus.Active
        });

        // Encode and submit the report (this will emit CurrentPricesUpdated and ResultUpdated)
        bytes memory encodedCurrentPrice = abi.encode(currentPriceResult);
        aimm.onReport("", encodedCurrentPrice);

        // Create a mock WorkflowResult for fair prices
        AIMM.WorkflowResult memory fairPriceResult = AIMM.WorkflowResult({
            workflowName: "fairPriceFetch",
            platform: "test",
            externalMarketId: "TEST-MARKET-001",
            optionAPrice: 55000000, // 55 cents fair price
            optionBPrice: 45000000, // 45 cents fair price
            volume: 0, // Volume not relevant for fair price
            status: AIMM.MarketStatus.Active
        });

        // Encode and submit the report (this will emit FairPricesUpdated and ResultUpdated)
        bytes memory encodedFairPrice = abi.encode(fairPriceResult);
        aimm.onReport("", encodedFairPrice);

        console.log("=== All Event Types Emitted Successfully ===");
        console.log("Events emitted:");
        console.log("  1. MarketOnboarded");
        console.log("  2. MarketConfigUpdated");
        console.log("  3. MarketStatusChanged");
        console.log("  4. DefaultConfigUpdated");
        console.log("  5. CurrentPricesUpdated");
        console.log("  6. FairPricesUpdated");
        console.log("  7. ResultUpdated (x2)");
    }

    /**
     * @notice Deploy AIMM and onboard Kalshi markets in one transaction
     */
    function deployWithKalshiMarkets() public returns (AIMM aimm) {
        // Deploy AIMM with default configuration
        aimm = run();

        // Onboard Kalshi markets
        onboardKalshiMarkets(aimm);

        return aimm;
    }
}