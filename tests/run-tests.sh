#!/bin/bash
# Test runner for Erbium addon

set -e

echo "================================"
echo "Running Erbium Addon Test Suite"
echo "================================"
echo

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED=0

# Function to run tests and track failures
run_test() {
    local test_name="$1"
    local test_command="$2"

    echo -e "${YELLOW}Running: ${test_name}${NC}"
    if eval "$test_command"; then
        echo -e "${GREEN}✓ ${test_name} passed${NC}"
        echo
        return 0
    else
        echo -e "${RED}✗ ${test_name} failed${NC}"
        echo
        FAILED=1
        return 1
    fi
}

# Backend tests
if [ -d "backend" ]; then
    cd backend
    if [ -f "package.json" ]; then
        echo "Installing backend dependencies..."
        npm install --silent
        run_test "Backend API Tests" "npm test"
    fi
    cd ..
fi

# Frontend tests
if [ -d "frontend" ]; then
    cd frontend
    if [ -f "package.json" ]; then
        echo "Installing frontend dependencies..."
        npm install --silent
        run_test "Frontend Tests" "npm test"
    fi
    cd ..
fi

# Shell script tests (if bats is installed)
if command -v bats &> /dev/null; then
    if [ -d "tests" ] && [ -f "tests/test-config-generation.bats" ]; then
        run_test "Configuration Generation Tests" "bats tests/test-config-generation.bats"
    fi
else
    echo -e "${YELLOW}⚠ Skipping shell tests (bats not installed)${NC}"
    echo
fi

# Configuration validation
run_test "Config YAML Validation" "python3 -c \"import yaml; yaml.safe_load(open('config.yaml'))\""

# Build configuration validation
run_test "Build YAML Validation" "python3 -c \"import yaml; yaml.safe_load(open('build.yaml'))\""

# Summary
echo "================================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
fi
