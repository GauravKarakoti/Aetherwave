#!/bin/bash

echo "🎯 Creating Aetherwave application..."

# Create application instance
linera project create

if [ $? -eq 0 ]; then
    echo "✅ Application created successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Start the oracle service: cd oracle-service && npm start"
    echo "   2. Start the frontend: cd frontend && npm run dev"
    echo "   3. Open http://localhost:5173 in your browser"
else
    echo "❌ Application creation failed!"
    exit 1
fi