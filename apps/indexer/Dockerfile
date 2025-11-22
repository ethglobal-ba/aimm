# Stage 1: Install dependencies
FROM oven/bun:1.2.18-slim AS dependencies
WORKDIR /usr/src/app

# Copy all package.json files and the lockfile to leverage Docker cache.
# This ensures that dependencies are only re-installed when package manifests change.
COPY package.json bun.lock ./
COPY packages/common/package.json ./packages/common/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY apps/indexer/package.json ./apps/indexer/package.json

# Install dependencies for the entire monorepo.
# Disable husky hooks in Docker builds
ENV HUSKY=0
RUN bun install

# Stage 2: Build the application
FROM oven/bun:1.2.18-slim AS builder
WORKDIR /usr/src/app

# Copy installed dependencies
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copy all source code
COPY . .

# Build the common package first (indexer depends on it)
WORKDIR /usr/src/app/packages/common
RUN bun run build

# Build any other packages if needed
WORKDIR /usr/src/app

# Stage 3: Create the final production image
FROM oven/bun:1.2.18-slim
WORKDIR /usr/src/app

# Copy production dependencies
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy built packages
COPY --from=builder /usr/src/app/packages ./packages

# Copy indexer application
COPY --from=builder /usr/src/app/apps/indexer ./apps/indexer

# Copy workspace configuration files
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/bun.lock ./bun.lock

# Set working directory to indexer
WORKDIR /usr/src/app/apps/indexer

# Set environment to production
ENV NODE_ENV=production

# Expose the port Ponder runs on
EXPOSE 42069

# Start the indexer
CMD ["bun", "run", "start"]