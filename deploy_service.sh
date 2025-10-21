#!/bin/bash

echo "🚀 Building Aetherwave service..."

# Build the Rust contract
cd linera
cargo build --target wasm32-unknown-unknown --release

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📦 Deploying to local Linera network..."
    
    # Publish the bytecode
    linera project publish
    
    echo "✅ Service deployed successfully!"
else
    echo "❌ Build failed!"
    exit 1
fi