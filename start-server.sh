#!/bin/bash

# PNG Template Generator - Server Startup Script
# This script starts a local web server to avoid CORS issues

echo "================================================"
echo "PNG Template Generator - Starting Local Server"
echo "================================================"
echo ""

# Function to kill process on port 8000
kill_port_8000() {
    echo "Checking for existing server on port 8000..."
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "Found existing server on port 8000. Stopping it..."
        lsof -ti:8000 | xargs kill -9 2>/dev/null
        sleep 1
        echo "✓ Existing server stopped"
    fi
}

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✓ Python 3 found"
    echo ""
    
    # Kill any existing server on port 8000
    kill_port_8000
    
    echo "Starting server on http://localhost:8000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    echo "Opening browser..."
    
    # Trap Ctrl+C to clean up properly
    trap 'echo ""; echo "Stopping server..."; kill $SERVER_PID 2>/dev/null; exit 0' INT
    
    # Start server in background
    python3 -m http.server 8000 &
    SERVER_PID=$!
    
    # Wait a moment for server to start
    sleep 2
    
    # Open browser based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open http://localhost:8000
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        xdg-open http://localhost:8000 2>/dev/null || echo "Please open http://localhost:8000 in your browser"
    else
        echo "Please open http://localhost:8000 in your browser"
    fi
    
    # Wait for user to stop
    echo ""
    echo "Server is running. Press Ctrl+C to stop."
    wait $SERVER_PID
    
elif command -v python &> /dev/null; then
    echo "✓ Python 2 found (Python 3 recommended)"
    echo ""
    echo "Starting server on http://localhost:8000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    python -m SimpleHTTPServer 8000
    
else
    echo "❌ Python not found!"
    echo ""
    echo "Please install Python or use one of these alternatives:"
    echo ""
    echo "Node.js:"
    echo "  npx http-server -p 8000"
    echo ""
    echo "PHP:"
    echo "  php -S localhost:8000"
    echo ""
    echo "Or simply open index.html in your browser"
    echo "(Note: You may encounter CORS issues without a server)"
fi

# Made with Bob
