#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Chukfi CMS Development Environment${NC}"
echo ""

# Check if backend directory exists
if [ ! -d "backend-test" ]; then
    echo -e "${YELLOW}Error: backend-test directory not found${NC}"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo -e "${YELLOW}Error: frontend directory not found${NC}"
    exit 1
fi

# Start backend server in background
echo -e "${GREEN}Starting backend server on port 8080...${NC}"
cd backend-test
go run main.go &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo -e "${GREEN}Starting frontend server on port 4321...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✓ Servers started successfully!${NC}"
echo ""
echo -e "Frontend: ${BLUE}http://localhost:4321${NC}"
echo -e "Backend:  ${BLUE}http://localhost:3000${NC}"
echo -e "Login:    ${BLUE}http://localhost:4321/login${NC}"
echo ""
echo -e "Default credentials:"
echo -e "  Email:    ${YELLOW}admin@chukfi.com${NC}"
echo -e "  Password: ${YELLOW}admin123${NC}"
echo ""
echo -e "Press Ctrl+C to stop both servers"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT

wait
