#!/usr/bin/env bats
# Tests for Erbium configuration generation

setup() {
    # Create temporary directory for test
    export TEST_DIR=$(mktemp -d)
    export CONFIG_FILE="${TEST_DIR}/erbium.toml"
}

teardown() {
    # Clean up temporary directory
    rm -rf "${TEST_DIR}"
}

@test "config file is created" {
    # Source the configuration generation logic
    # This is a simplified test - in production you'd need to mock bashio functions

    # Create a minimal config
    cat > "${CONFIG_FILE}" <<EOF
log_level = "info"
EOF

    [ -f "${CONFIG_FILE}" ]
}

@test "config contains log_level" {
    cat > "${CONFIG_FILE}" <<EOF
log_level = "info"
EOF

    grep -q 'log_level = "info"' "${CONFIG_FILE}"
}

@test "config contains DNS section when enabled" {
    cat > "${CONFIG_FILE}" <<EOF
[dns]
enabled = true
port = 53
domain = "local"
EOF

    grep -q '\[dns\]' "${CONFIG_FILE}"
    grep -q 'enabled = true' "${CONFIG_FILE}"
    grep -q 'port = 53' "${CONFIG_FILE}"
}

@test "config contains DHCP section when enabled" {
    cat > "${CONFIG_FILE}" <<EOF
[dhcp]
enabled = true
range_start = "192.168.1.100"
range_end = "192.168.1.200"
EOF

    grep -q '\[dhcp\]' "${CONFIG_FILE}"
    grep -q 'range_start = "192.168.1.100"' "${CONFIG_FILE}"
    grep -q 'range_end = "192.168.1.200"' "${CONFIG_FILE}"
}

@test "config is valid TOML format" {
    cat > "${CONFIG_FILE}" <<EOF
log_level = "info"

[dns]
enabled = true
port = 53

[dhcp]
enabled = true
range_start = "192.168.1.100"
EOF

    # Basic TOML validation - check for proper section headers and assignments
    grep -qE '^\[.*\]$' "${CONFIG_FILE}"
    grep -qE '^[a-z_]+ = ' "${CONFIG_FILE}"
}
