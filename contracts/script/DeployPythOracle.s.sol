// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {Script, console} from "forge-std/Script.sol";
import {PythOracle} from "../src/PythOracle.sol";

contract DeployPythOracle is Script {
    address public constant PYTH_BASE_SEPOLIA = 0xA2aa501b19aff244D90cc15a4Cf739D2725B5729;

    function run() public returns (PythOracle pythOracle) {
        console.log("Deploying PythOracle to Base Sepolia");
        console.log("  Pyth Contract:", PYTH_BASE_SEPOLIA);

        vm.startBroadcast();
        pythOracle = new PythOracle(PYTH_BASE_SEPOLIA);
        vm.stopBroadcast();

        console.log("PythOracle deployed at:", address(pythOracle));
        return pythOracle;
    }
}