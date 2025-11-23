# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Install bun
RUN npm install -g bun

# Set working directory
WORKDIR /app

# Copy workspace package files first (for better layer caching)
COPY package.json bun.lock ./

# Copy indexer package.json
COPY apps/indexer/package.json ./apps/indexer/

# Install dependencies from the root (this handles workspace deps)
# Try normal install first, fall back to ignore-scripts if needed
RUN bun install || bun install --ignore-scripts

# Remove the node_modules created by bun install to avoid COPY conflicts with symlinks
RUN rm -rf apps/indexer/node_modules

# Copy indexer source code
COPY apps/indexer ./apps/indexer

# Switch to indexer directory and install indexer-specific dependencies properly
WORKDIR /app/apps/indexer
RUN bun install


# Expose the port Ponder runs on
EXPOSE 42069

# Set environment to production
ENV NODE_ENV=production

# Start the indexer using globally installed ponder
CMD ["bun", "run", "start"]