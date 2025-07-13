#!/bin/bash

# Script to read environment variables from .env file and set them for iOS build

ENV_FILE="../.env"

if [[ -f "$ENV_FILE" ]]; then
  # Read and export variables from .env file
  export $(grep -v '^#' "$ENV_FILE" | xargs)
  
  # Create a temporary plist with the API key
  if [[ -n "$GOOGLE_MAPS_API_KEY" ]]; then
    echo "Setting Google Maps API Key for iOS build..."
    # You can add additional processing here if needed
  else
    echo "Warning: GOOGLE_MAPS_API_KEY not found in .env file"
  fi
else
  echo "Warning: .env file not found at $ENV_FILE"
fi