#!/bin/bash

# Diplomatrix AI - Quick Deployment Setup Script
# This script helps with local setup for deployment testing

set -e

echo "🚀 Diplomatrix AI - Deployment Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from root directory
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Backend setup
echo -e "${BLUE}Setting up Backend...${NC}"
cd backend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please update backend/.env with your ANTHROPIC_API_KEY${NC}"
fi

# Check virtual environment
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -q -r requirements.txt

echo -e "${GREEN}✅ Backend setup complete${NC}"
cd ..

# Frontend setup
echo ""
echo -e "${BLUE}Setting up Frontend...${NC}"
cd frontend

# Install dependencies
echo "Installing Node dependencies..."
npm install --silent

echo -e "${GREEN}✅ Frontend setup complete${NC}"
cd ..

echo ""
echo -e "${GREEN}Setup complete! Next steps:${NC}"
echo ""
echo "1️⃣  Update backend/.env with your Anthropic API key"
echo "2️⃣  Read DEPLOYMENT.md for Render + Vercel deployment guide"
echo "3️⃣  Test locally:"
echo "   - Terminal 1: cd backend && source .venv/bin/activate && uvicorn app.main:app --reload"
echo "   - Terminal 2: cd frontend && npm run dev"
echo ""
echo -e "${BLUE}For deployment questions, see: DEPLOYMENT.md${NC}"
