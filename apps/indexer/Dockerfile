# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Install bun
RUN npm install -g bun

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Expose the port Ponder runs on
EXPOSE 42069

# Set environment to production
ENV NODE_ENV=production

# Start the indexer
CMD ["bun", "run", "start"]