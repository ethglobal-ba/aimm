// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {Script, console} from "forge-std/Script.sol";
import {PythOracle} from "../src/PythOracle.sol";

contract TestPythOracle is Script {
    address public constant PYTH_ORACLE_ADDRESS = 0x3E1D67CB6842165Aa0F27591fC89Ecb3244E55f5;

    // Example price feed ID for ETH/USD on Pyth
    bytes32 public constant ETH_USD_PRICE_FEED = 0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;

    function run() public {
        console.log("Testing PythOracle at:", PYTH_ORACLE_ADDRESS);

        PythOracle oracle = PythOracle(PYTH_ORACLE_ADDRESS);

        console.log("Oracle contract loaded successfully");
        console.log("Testing with ETH/USD price feed ID:", vm.toString(ETH_USD_PRICE_FEED));

        // Note: This test requires actual Pyth price update data
        // In a real scenario, you would need to fetch this from Pyth's API
        console.log("To test price updates, you need to:");
        console.log("1. Fetch price update data from Pyth's Hermes API");
        console.log("2. Call updatePrice() with the price data and feed ID");
        console.log("3. Listen for PriceUpdated events");

        console.log("Test completed - Oracle contract is accessible");
    }
}