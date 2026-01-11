#!/bin/bash
# ==============================================================================
# Integration test for Erbium Home Assistant addon
# Tests the complete addon in a container environment similar to Home Assistant
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "${SCRIPT_DIR}")"
TEST_DATA_DIR="/tmp/erbium-addon-test-data"
IMAGE_NAME="erbium-addon-test"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

cleanup() {
    log_info "Cleaning up test containers and data..."
    docker rm -f erbium-addon-test 2>/dev/null || true
    rm -rf "${TEST_DATA_DIR}"
}

# Set trap to cleanup on exit
trap cleanup EXIT

log_info "Starting integration test for Erbium addon..."

# Step 1: Build the Docker image
log_info "Building Docker image..."
cd "${PROJECT_DIR}"
docker build \
    --build-arg BUILD_FROM=ghcr.io/home-assistant/amd64-base:3.18 \
    --tag "${IMAGE_NAME}" \
    --file Dockerfile \
    . || {
        log_error "Docker build failed"
        exit 1
    }

log_info "✓ Docker build successful"

# Step 2: Create test data directory (simulates /data mount in Home Assistant)
log_info "Creating test data directory..."
mkdir -p "${TEST_DATA_DIR}"

# Step 3: Create test options.json (simulates Home Assistant addon config)
log_info "Creating test configuration..."
cat > "${TEST_DATA_DIR}/options.json" <<'EOF'
{
  "dns_enabled": true,
  "dhcp_enabled": true,
  "router_advertisements_enabled": false,
  "domain": "test.local",
  "dns_port": 53,
  "dhcp_range_start": "192.168.99.100",
  "dhcp_range_end": "192.168.99.200",
  "dhcp_lease_time": "12h",
  "gateway": "192.168.99.1",
  "dns_servers": ["8.8.8.8", "1.1.1.1"],
  "log_level": "info"
}
EOF

log_info "✓ Test configuration created"

# Step 4: Run the container
log_info "Starting container..."
docker run -d \
    --name erbium-addon-test \
    --privileged \
    -v "${TEST_DATA_DIR}:/data" \
    "${IMAGE_NAME}" || {
        log_error "Failed to start container"
        exit 1
    }

log_info "✓ Container started"

# Step 5: Wait for services to start
log_info "Waiting for services to initialize..."
sleep 5

# Step 6: Check if services are running
log_info "Checking service status..."

# Get container logs
LOGS=$(docker logs erbium-addon-test 2>&1)

# Check for errors
if echo "${LOGS}" | grep -i "ERROR" | grep -v "test" > /dev/null; then
    log_error "Found errors in container logs:"
    echo "${LOGS}" | grep -i "ERROR"
    exit 1
fi

log_info "✓ No errors in logs"

# Check if Erbium started
if ! echo "${LOGS}" | grep "erbium 1.0" > /dev/null; then
    log_error "Erbium did not start"
    echo "${LOGS}"
    exit 1
fi

log_info "✓ Erbium started successfully"

# Check if DNS service is listening
if ! echo "${LOGS}" | grep "Listening for DNS" > /dev/null; then
    log_error "DNS service not listening"
    echo "${LOGS}"
    exit 1
fi

log_info "✓ DNS service started"

# Step 7: Check that config file was created
if ! docker exec erbium-addon-test test -f /data/erbium.conf; then
    log_error "Configuration file not created"
    exit 1
fi

log_info "✓ Configuration file created"

# Step 8: Validate configuration file contents
log_info "Validating configuration file..."
CONFIG=$(docker exec erbium-addon-test cat /data/erbium.conf)

if ! echo "${CONFIG}" | grep "addresses:" > /dev/null; then
    log_error "Configuration missing addresses section"
    echo "${CONFIG}"
    exit 1
fi

if ! echo "${CONFIG}" | grep "192.168.99.0/24" > /dev/null; then
    log_error "Configuration has incorrect network"
    echo "${CONFIG}"
    exit 1
fi

if ! echo "${CONFIG}" | grep "dhcp-policies:" > /dev/null; then
    log_error "Configuration missing DHCP section"
    echo "${CONFIG}"
    exit 1
fi

log_info "✓ Configuration is valid"

# Step 9: Check that database directory exists and is writable
if ! docker exec erbium-addon-test test -d /var/lib/erbium; then
    log_error "Erbium data directory does not exist"
    exit 1
fi

log_info "✓ Data directory exists"

# Step 10: Check that SQLite database was created
sleep 2  # Give DHCP service time to create database
if ! docker exec erbium-addon-test test -f /var/lib/erbium/leases.sqlite; then
    log_warn "SQLite database not created (DHCP may not be fully initialized)"
    # Not a fatal error - might need actual DHCP traffic
fi

# Step 11: Check backend service
log_info "Checking backend service..."
if ! echo "${LOGS}" | grep -i "backend" > /dev/null; then
    log_warn "Backend service may not have started (check if s6 service exists)"
fi

# Step 12: Check service scripts are executable
log_info "Checking service script permissions..."
docker exec erbium-addon-test test -x /etc/services.d/erbium/run || {
    log_error "Erbium run script is not executable"
    exit 1
}

docker exec erbium-addon-test test -x /etc/services.d/erbium/finish || {
    log_error "Erbium finish script is not executable"
    exit 1
}

log_info "✓ Service scripts are executable"

# Step 13: Test that container stays running
log_info "Checking container stability..."
sleep 3
if ! docker ps | grep erbium-addon-test > /dev/null; then
    log_error "Container stopped unexpectedly"
    docker logs erbium-addon-test
    exit 1
fi

log_info "✓ Container is stable"

# Step 14: Display summary
log_info ""
log_info "=========================================="
log_info "Integration test PASSED ✓"
log_info "=========================================="
log_info ""
log_info "Container logs:"
echo "${LOGS}"
log_info ""
log_info "Configuration file:"
echo "${CONFIG}"

exit 0
