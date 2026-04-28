#!/bin/bash

# Exit on error
set -e

echo "Starting Web TV Simulator setup..."

# Check for gcloud CLI
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check for ADC credentials
if [ ! -f "$HOME/.config/gcloud/application_default_credentials.json" ]; then
    echo "Warning: Application Default Credentials (ADC) not found."
    echo "You may need to run: gcloud auth application-default login"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Start the application
echo "Starting the application..."
npm run dev
