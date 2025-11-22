#!/usr/bin/env node

import { createPublicClient, http, keccak256, toHex } from 'viem';
import { baseSepolia } from 'viem/chains';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http('https://base-sepolia.g.alchemy.com/v2/gGHxSH89EUjqrTIBQOcSAtpQsvTANxy7')
});

const contractAddress = '0xEC767714Eb59B730e0Ec1d8d713ba3b3F2822fe0';
const startBlock = 34015520n; // Start very close to deployment

async function checkEvents() {
  try {
    console.log('Checking for events on contract:', contractAddress);
    console.log('Starting from block:', startBlock.toString());

    // Get current block number
    const currentBlock = await client.getBlockNumber();
    console.log('Current block:', currentBlock.toString());

    // Check for MarketOnboarded events
    console.log('\n--- Checking MarketOnboarded events ---');
    const marketOnboardedTopic = keccak256(toHex('MarketOnboarded(string,string,string,string,string)'));
    console.log('MarketOnboarded topic:', marketOnboardedTopic);

    // Check in small chunks for MarketOnboarded
    let marketOnboardedCount = 0;
    const endBlock = currentBlock < startBlock + 50n ? currentBlock : startBlock + 50n;
    for (let block = startBlock; block < endBlock; block += 10n) {
      try {
        const toBlock = block + 9n < currentBlock ? block + 9n : currentBlock;
        const logs = await client.getLogs({
          address: contractAddress,
          fromBlock: block,
          toBlock: toBlock,
          topics: [marketOnboardedTopic]
        });
        marketOnboardedCount += logs.length;
        if (logs.length > 0) {
          console.log(`Found ${logs.length} MarketOnboarded events in blocks ${block}-${toBlock}`);
        }
      } catch (e) {
        console.log(`Error checking MarketOnboarded in blocks ${block}-${block + 9n}:`, e.message);
      }
    }
    console.log('Total MarketOnboarded events found:', marketOnboardedCount);

    // Check for MarketConfigUpdated events
    console.log('\n--- Checking MarketConfigUpdated events ---');
    const marketConfigTopic = keccak256(toHex('MarketConfigUpdated(string,string,uint256,uint256,uint256)'));
    console.log('MarketConfigUpdated topic:', marketConfigTopic);

    let marketConfigCount = 0;
    for (let block = startBlock; block < endBlock; block += 10n) {
      try {
        const toBlock = block + 9n < currentBlock ? block + 9n : currentBlock;
        const logs = await client.getLogs({
          address: contractAddress,
          fromBlock: block,
          toBlock: toBlock,
          topics: [marketConfigTopic]
        });
        marketConfigCount += logs.length;
        if (logs.length > 0) {
          console.log(`Found ${logs.length} MarketConfigUpdated events in blocks ${block}-${toBlock}`);
        }
      } catch (e) {
        console.log(`Error checking MarketConfigUpdated in blocks ${block}-${block + 9n}:`, e.message);
      }
    }
    console.log('Total MarketConfigUpdated events found:', marketConfigCount);

    // Get all events to see what's actually being emitted (use smaller chunks)
    console.log('\n--- Checking all events ---');
    const chunkSize = 10n; // Alchemy free tier limit
    let totalEvents = 0;
    const eventCounts = {};

    const maxBlock = currentBlock < startBlock + 100n ? currentBlock : startBlock + 100n;
    for (let fromBlock = startBlock; fromBlock < maxBlock; fromBlock += chunkSize) {
      const toBlock = fromBlock + chunkSize - 1n < currentBlock ? fromBlock + chunkSize - 1n : currentBlock;

      console.log(`Checking blocks ${fromBlock} to ${toBlock}...`);

      try {
        const allLogs = await client.getLogs({
          address: contractAddress,
          fromBlock: fromBlock,
          toBlock: toBlock
        });

        totalEvents += allLogs.length;
        console.log(`  Found ${allLogs.length} events`);

        // Group by topic
        allLogs.forEach(log => {
          const topic = log.topics[0];
          eventCounts[topic] = (eventCounts[topic] || 0) + 1;
        });
      } catch (error) {
        console.log(`  Error in range ${fromBlock}-${toBlock}:`, error.message);
      }
    }

    console.log('Total events found:', totalEvents);
    console.log('\nEvent counts by topic:');
    Object.entries(eventCounts).forEach(([topic, count]) => {
      console.log(`${topic}: ${count} events`);
    });

  } catch (error) {
    console.error('Error checking events:', error);
  }
}

checkEvents();
