# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Install bun
RUN npm install -g bun

# Set working directory
WORKDIR /app

# Copy workspace package files first (for better layer caching)
COPY package.json bun.lock ./
COPY packages/common/package.json ./packages/common/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY apps/indexer/package.json ./apps/indexer/

# Install dependencies from the root (this handles workspace deps)
RUN bun install

# Copy workspace packages source code
COPY packages/common ./packages/common
COPY packages/eslint-config ./packages/eslint-config
COPY packages/typescript-config ./packages/typescript-config

# Build the common package
WORKDIR /app/packages/common
RUN bun run build

# Switch back to app directory
WORKDIR /app

# Copy indexer source code
COPY apps/indexer ./apps/indexer

# Switch to indexer directory
WORKDIR /app/apps/indexer

# Expose the port Ponder runs on
EXPOSE 42069

# Set environment to production
ENV NODE_ENV=production

# Start the indexer
CMD ["bun", "run", "start"]