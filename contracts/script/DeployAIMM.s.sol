// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

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
        uint256 driftPercentagePoints =
            vm.envOr("AIMM_DRIFT_PERCENTAGE", DEFAULT_DRIFT_PERCENTAGE_POINTS);
        uint256 maxSpendAmount = vm.envOr("AIMM_MAX_SPEND_AMOUNT", DEFAULT_MAX_SPEND_AMOUNT);
        uint256 slippageToleranceBps =
            vm.envOr("AIMM_SLIPPAGE_TOLERANCE", DEFAULT_SLIPPAGE_TOLERANCE_BPS);

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
            50 // 0.5% slippage tolerance (lower for testnet)
        );
    }

    /**
     * @notice Deploy AIMM for mainnet with conservative values
     */
    function deployForMainnet() public returns (AIMM aimm) {
        return deployWithCustomConfig(
            250, // 2.5% drift (more conservative)
            50 ether, // 50 ETH max spend (higher for mainnet)
            200 // 2% slippage tolerance (higher for mainnet)
        );
    }

    /**
     * @notice Onboard Kalshi prediction markets to the AIMM contract
     * @param aimm The deployed AIMM contract instance
     */
    function onboardKalshiMarkets(AIMM aimm) public {
        console.log("\n=== Onboarding Kalshi Markets ===");

        vm.startBroadcast();

        // 1. Trump Endorsement - Daniel Cameron (Kentucky Senate)
        aimm.onboardMarket(
            AIMM.OnboardMarketParams({
                ticker: "KXTRUMPENDORSE-26SEP15-DCAM",
                platform: AIMM.Platforms.KALSHI,
                marketName: "Will Donald Trump endorse Daniel Cameron in the 2026 Kentucky Senate Republican primary before May 19, 2026?",
                subtitle: ":: Kentucky Senate",
                eventTicker: "KXTRUMPENDORSE-26SEP15",
                optionACurrentExternalPrice: 21000000, // yes_ask: 21 cents
                optionBCurrentExternalPrice: 89000000, // no_bid: ~89 cents (100-11)
                initialVolume: 0,
                imageUrl: "https://example.com/image.jpg"
            })
        );
        console.log("Onboarded: Daniel Cameron Kentucky Senate Endorsement");

        // 2. Trump Endorsement - Barry Moore (Alabama Senate)
        aimm.onboardMarket(
            AIMM.OnboardMarketParams({
                ticker: "KXTRUMPENDORSE-26SEP15-BMOR",
                platform: AIMM.Platforms.KALSHI,
                marketName: "Will Donald Trump endorse Barry Moore in the 2026 Alabama Senate Republican primary before May 19, 2026?",
                subtitle: ":: Alabama Senate",
                eventTicker: "KXTRUMPENDORSE-26SEP15",
                optionACurrentExternalPrice: 33000000, // yes_ask: 33 cents
                optionBCurrentExternalPrice: 77000000, // no_bid: 77 cents
                initialVolume: 0,
                imageUrl: "https://example.com/image.jpg"
            })
        );
        console.log("Onboarded: Barry Moore Alabama Senate Endorsement");

        // 3. Trump Endorsement - Buddy Carter (Georgia Senate)
        aimm.onboardMarket(
            AIMM.OnboardMarketParams({
                ticker: "KXTRUMPENDORSE-26SEP15-BCAR",
                platform: AIMM.Platforms.KALSHI,
                marketName: "Will Donald Trump endorse Buddy Carter in the 2026 Georgia Senate Republican primary before May 19, 2026?",
                subtitle: ":: Georgia Senate",
                eventTicker: "KXTRUMPENDORSE-26SEP15",
                optionACurrentExternalPrice: 15000000, // yes_ask: 15 cents
                optionBCurrentExternalPrice: 95000000, // no_bid: 95 cents
                initialVolume: 0,
                imageUrl: "https://example.com/image.jpg"
            })
        );
        console.log("Onboarded: Buddy Carter Georgia Senate Endorsement");

        // 4. Trump Endorsement - Andy Barr (Kentucky Senate)
        aimm.onboardMarket(
            AIMM.OnboardMarketParams({
                ticker: "KXTRUMPENDORSE-26SEP15-ABAR",
                platform: AIMM.Platforms.KALSHI,
                marketName: "Will Donald Trump endorse Andy Barr in the 2026 Kentucky Senate Republican primary before May 19, 2026?",
                subtitle: ":: Kentucky Senate",
                eventTicker: "KXTRUMPENDORSE-26SEP15",
                optionACurrentExternalPrice: 68000000, // yes_ask: 68 cents
                optionBCurrentExternalPrice: 42000000, // no_bid: 42 cents
                initialVolume: 0,
                imageUrl: "https://example.com/image.jpg"
            })
        );
        console.log("Onboarded: Andy Barr Kentucky Senate Endorsement");

        // 5. Trump Endorsement - Julia Letlow (Louisiana Senate)
        aimm.onboardMarket(
            AIMM.OnboardMarketParams({
                ticker: "KXTRUMPENDORSE-26SEP15-JLET",
                platform: AIMM.Platforms.KALSHI,
                marketName: "Will Donald Trump endorse Julia Letlow in the 2026 Louisiana Senate Republican primary before May 16, 2026?",
                subtitle: ":: Louisiana Senate",
                eventTicker: "KXTRUMPENDORSE-26SEP15",
                optionACurrentExternalPrice: 20000000, // yes_ask: 20 cents
                optionBCurrentExternalPrice: 90000000, // no_bid: 90 cents
                initialVolume: 0,
                imageUrl: "https://example.com/image.jpg"
            })
        );
        console.log("Onboarded: Julia Letlow Louisiana Senate Endorsement");

        // Set markets to active status (except the first one)
        console.log("\n=== Setting Markets to Active Status ===");

        // Activate all markets except Daniel Cameron (index 0)
        aimm.updateMarketStatus("KXTRUMPENDORSE-26SEP15-BMOR", AIMM.MarketStatus.Active);
        console.log("Activated: Barry Moore Alabama Senate");

        aimm.updateMarketStatus("KXTRUMPENDORSE-26SEP15-BCAR", AIMM.MarketStatus.Active);
        console.log("Activated: Buddy Carter Georgia Senate");

        aimm.updateMarketStatus("KXTRUMPENDORSE-26SEP15-ABAR", AIMM.MarketStatus.Active);
        console.log("Activated: Andy Barr Kentucky Senate");

        aimm.updateMarketStatus("KXTRUMPENDORSE-26SEP15-JLET", AIMM.MarketStatus.Active);
        console.log("Activated: Julia Letlow Louisiana Senate");

        console.log("Note: Daniel Cameron market left as Inactive for testing");

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

        for (uint256 i = 0; i < marketIds.length && i < 2; i++) {
            string memory marketId = marketIds[i];
            console.log("Checking market ID:", marketId);

            try aimm.getMarket(marketId) returns (AIMM.ExternalMarket memory market) {
                console.log("  External Market ID (key):", marketId);
                console.log("  Platform (should be KALSHI):", uint256(market.platform));
                console.log("  Market Name:", market.marketName);

                // Verify this is correct: platform should be "kalshi", marketId should be ticker
                if (market.platform != AIMM.Platforms.KALSHI) {
                    console.log(
                        "  [WARNING] Platform is not KALSHI, found:", uint256(market.platform)
                    );
                    console.log("  [WARNING] This suggests parameter swapping occurred!");
                }

                // Check if marketId looks like a Kalshi ticker (starts with 'KX')
                if (bytes(marketId).length > 2) {
                    if (bytes(marketId)[0] == "K" && bytes(marketId)[1] == "X") {
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
        aimm.onboardMarket(
            AIMM.OnboardMarketParams({
                ticker: "TEST-MARKET-001",
                platform: AIMM.Platforms.KALSHI,
                marketName: "Test Market for Verification",
                subtitle: "SUBTITLETEST-MARKET-001", // subtitle with prefix
                eventTicker: "EVENTTEST-MARKET-001", // eventTicker with prefix
                optionACurrentExternalPrice: 50000000, // 50 cents
                optionBCurrentExternalPrice: 50000000, // 50 cents
                initialVolume: 1000000000000000000, // 1 ETH volume
                imageUrl: "https://example.com/test-image.jpg"
            })
        );

        // 2. MarketConfigUpdated - Update the test market config
        console.log("Emitting MarketConfigUpdated event...");
        aimm.updateMarketConfig(
            "TEST-MARKET-001",
            600, // 6% min price difference
            20 ether, // 20 ETH max spend
            150 // 1.5% slippage tolerance
        );

        // 3. MarketStatusChanged - Change the test market status
        console.log("Emitting MarketStatusChanged event...");
        aimm.updateMarketStatus("TEST-MARKET-001", AIMM.MarketStatus.Active);

        // 4. MarketStatusUpdated - Change the test market status with new function
        console.log("Emitting MarketStatusUpdated event...");
        aimm.changeMarketStatus("TEST-MARKET-001", AIMM.MarketStatus.ClosedInternal);

        // 5. DefaultConfigUpdated - Update default configuration
        console.log("Emitting DefaultConfigUpdated event...");
        aimm.updateDefaultConfig(
            700, // 7% drift percentage
            25 ether, // 25 ETH max spend
            175 // 1.75% slippage tolerance
        );

        // 6. CurrentPricesUpdated & 7. FairPricesUpdated & 8. ResultUpdated
        // These are emitted by calling the receiver template with mock data
        console.log("Emitting CurrentPricesUpdated, FairPricesUpdated, and ResultUpdated events...");

        // Create a mock WorkflowResult for current prices
        AIMM.WorkflowResult memory currentPriceResult = AIMM.WorkflowResult({
            workflowName: "currentPriceFetch",
            platform: AIMM.Platforms.KALSHI,
            ticker: "TEST-MARKET-001",
            optionAPrice: 600000, // 0.600000 USDC
            optionBPrice: 400000, // 0.400000 USDC
            volume: 2000000000000000000, // $2,000,000,000,000.000000 USDC volume
            status: AIMM.MarketStatus.Active
        });

        // Encode and submit the report (this will emit CurrentPricesUpdated and ResultUpdated)
        bytes memory encodedCurrentPrice = abi.encode(currentPriceResult);
        aimm.onReport("", encodedCurrentPrice);

        // Create a mock WorkflowResult for fair prices
        AIMM.WorkflowResult memory fairPriceResult = AIMM.WorkflowResult({
            workflowName: "fairPriceFetch",
            platform: AIMM.Platforms.KALSHI,
            ticker: "TEST-MARKET-001",
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
        console.log("  4. MarketStatusUpdated");
        console.log("  5. DefaultConfigUpdated");
        console.log("  6. CurrentPricesUpdated");
        console.log("  7. FairPricesUpdated");
        console.log("  8. ResultUpdated (x2)");
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
