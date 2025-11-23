# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Install bun
RUN npm install -g bun

# Set working directory
WORKDIR /app

# Copy workspace package files first (for better layer caching)
COPY package.json bun.lock ./

# Copy all workspace packages (they have config files needed during install)
COPY packages/eslint-config ./packages/eslint-config
COPY packages/typescript-config ./packages/typescript-config
COPY packages/aimm-sdk ./packages/aimm-sdk

# Copy indexer package.json
COPY apps/indexer/package.json ./apps/indexer/

# Install dependencies from the root (this handles workspace deps)
# Try normal install first, fall back to ignore-scripts if needed
RUN bun install || bun install --ignore-scripts

# Copy indexer source code
COPY apps/indexer ./apps/indexer

# Switch to indexer directory
WORKDIR /app/apps/indexer

# Expose the port Ponder runs on
EXPOSE 42069

# Set environment to production
ENV NODE_ENV=production

# Start the indexer using npx to ensure ponder is found
CMD ["npx", "ponder", "start"]