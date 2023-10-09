#!/usr/bin/env bash

# Build  assets from src folder
npm run bundle
npm run tailwind

# Copy static assets to dist folder
cp -r src/*.png dist
cp src/favicon.ico dist
cp src/index.html dist

# Update version number placeholder in index.html
INDEX_FILE="dist/index.html"
VERSION_NUMBER=$(jq -r .version package.json)

if [ -z "$VERSION_NUMBER" ]; then
  echo "Error: Version number not found."
  exit 1
fi

sed -i.bak "s/%VERSION_NUMBER%/$VERSION_NUMBER/g" $INDEX_FILE

# Check if sed command succeeded
if [ $? -ne 0 ]; then
  echo "Error: Failed to update version number in $INDEX_FILE."
  exit 1
fi

echo "Version number updated to $VERSION_NUMBER in $INDEX_FILE."

# Remove existing zip of dist files (if it exists), and recreate it with new build.
if ls dist/*.zip 1>/dev/null 2>&1; then
  echo "Cleaning up old zip files."
  rm dist/*.zip
fi

# Remove any sed backup files
if ls dist/*.bak 1>/dev/null 2>&1; then
  echo "Cleaning up old backup files."
  rm dist/*.bak
fi

ZIP_FILE_NAME=deso-offline-tool-v$VERSION_NUMBER.zip

echo "Creating new zip file: $ZIP_FILE_NAME"
zip -r $ZIP_FILE_NAME dist && mv $ZIP_FILE_NAME dist
