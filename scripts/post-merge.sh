#!/bin/bash
set -e

echo "Running post-merge setup..."

# Install dependencies (non-interactive)
npm install --yes 2>&1

echo "Post-merge setup complete."
