#!/bin/bash

# Set variables
# export SERVER="root@216.81.248.27" # Old server, down
# export SERVER="root@38.224.253.95" # Fluence is the best server ever
export SERVER="root@88.99.96.175"
export REMOTE_DIR="/root/aimm"

# No need to run a build step since Bun can run TypeScript files directly
echo "Deploying to ${SERVER}:${REMOTE_DIR}..."

echo "SSHing to server to create directory" 
# Create the directory on the server if it doesn't exist
ssh $SERVER "'mkdir -p $REMOTE_DIR'"

echo "Rsyncing files"
# Use rsync to transfer files, excluding those in .gitignore
rsync -avz --exclude-from=.gitignore \
  . "$SERVER:$REMOTE_DIR/" \
  --exclude=".git/" \
  --exclude="node_modules/" \

echo "Files transferred successfully!"


# Copy haproxy config and restart, then start docker
echo "Building images and restarting services..."
ssh $SERVER << EOF
  set -e
  
  cd $REMOTE_DIR
  docker compose down
  docker compose up --build -d
EOF

echo "Deployment completed successfully!" 
