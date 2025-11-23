// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract PythOracle {
    IPyth pyth;

    event PriceUpdated(bytes32 indexed priceFeedId, int64 price, uint256 publishTime);

    constructor(address pythContract) {
        pyth = IPyth(pythContract);
    }

    function updatePrice(bytes[] calldata priceUpdate, bytes32 priceFeedId) external payable {
        uint fee = pyth.getUpdateFee(priceUpdate);
        pyth.updatePriceFeeds{value: fee}(priceUpdate);

        PythStructs.Price memory price = pyth.getPriceNoOlderThan(priceFeedId, 60);
        emit PriceUpdated(priceFeedId, price.price, price.publishTime);
    }
}