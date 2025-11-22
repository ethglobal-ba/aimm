# Update Market Config Script

This Python script allows you to easily call the `updateMarketConfig` function on the AIMM smart contract.

## Setup

1. **Install dependencies:**
   ```bash
   cd apps/agent
   poetry install
   ```

2. **Configure environment variables:**
   Edit the `.env` file and set your private key:
   ```bash
   PRIVATE_KEY=your_actual_private_key_here
   ```

   You can also optionally set:
   ```bash
   RPC_URL=https://your-preferred-rpc-endpoint.com  # Default: Base Sepolia
   ```

## Usage

```bash
poetry run python update_market_config.py <market_id> <min_price_diff> <max_spend> <slippage_bps>
```

### Parameters

- **market_id**: External market identifier (string) - e.g., "polymarket-123"
- **min_price_diff**: Minimum price difference in wei (uint256) - e.g., 1000
- **max_spend**: Maximum spend amount in wei (uint256) - e.g., 5000000000000000000 (5 ETH)
- **slippage_bps**: Slippage tolerance in basis points (uint256) - e.g., 300 (3%)

### Examples

**Basic usage:**
```bash
poetry run python update_market_config.py "polymarket-123" 1000 5000000000000000000 300
```

**With different values:**
```bash
# Market "test-market" with 0.001 ETH min diff, 10 ETH max spend, 5% slippage
poetry run python update_market_config.py "test-market" 1000000000000000 10000000000000000000 500
```

**Converting from ETH to wei:**
- 1 ETH = 1,000,000,000,000,000,000 wei (18 decimals)
- 0.1 ETH = 100,000,000,000,000,000 wei
- 0.01 ETH = 10,000,000,000,000,000 wei
- 0.001 ETH = 1,000,000,000,000,000 wei

### What the script does:

1. Connects to the Base Sepolia network (or your configured RPC)
2. Loads your private key from the environment
3. Estimates gas for the transaction
4. Shows you transaction details and cost
5. Asks for confirmation before sending
6. Sends the transaction and waits for confirmation
7. Reports success or failure

### Security Notes

- **Never commit your private key to git**
- Keep your `.env` file secure
- Test with small amounts first
- Verify the contract address is correct
- Double-check your parameters before confirming

### Contract Information

- **Contract Address**: `0xff3F84978B81f0457584919213fdDeBD579E74B1`
- **Network**: Base Sepolia (Chain ID: 84532)
- **Function**: `updateMarketConfig(string externalMarketId, uint256 minPriceDiff, uint256 maxSpend, uint256 slippageBps)`

### Troubleshooting

**"Error: PRIVATE_KEY environment variable is required"**
- Make sure you've set your private key in the `.env` file

**"Error: Unable to connect to RPC"**
- Check your internet connection
- Verify the RPC URL is correct
- Try a different RPC endpoint

**"Transaction failed"**
- Ensure you have enough ETH for gas
- Check that your account has permission to call the function (are you the owner?)
- Verify the market exists with the given ID

**Gas estimation fails**
- The transaction might revert - check your parameters
- Ensure the market ID exists in the contract
- Make sure you're using the correct account