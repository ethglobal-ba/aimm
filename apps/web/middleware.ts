import { paymentMiddleware } from 'x402-next';

// Hard-coded receiving wallet for x402 payments (testnet Base Sepolia).
const RECEIVING_WALLET = '0x3E1D67CB6842165Aa0F27591fC89Ecb3244E55f5';

export const middleware = paymentMiddleware(
  RECEIVING_WALLET,
  {
    '/api/402': {
      price: '$0.001',
      network: 'base-sepolia',
      config: {
        description: 'Trigger AIMM fair price recompute via AIMM agent',
      },
    },
  },
  {
    // Testnet facilitator for Base Sepolia, per x402 seller quickstart:
    // https://docs.cdp.coinbase.com/x402/quickstart-for-sellers#next-js
    url: 'https://x402.org/facilitator',
  }
);

export const config = {
  matcher: ['/api/402/:path*'],
};
