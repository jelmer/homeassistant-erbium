# Erbium Addon Tests

This directory contains tests for the Erbium Home Assistant addon.

## Test Structure

```
tests/
├── integration-test.sh          # Full integration test (Docker container)
├── test-config-generation.bats  # Shell script tests using Bats
└── run-tests.sh                  # Test runner script

backend/
└── server.test.js                # Backend API tests using Jest

frontend/
└── app.test.js                   # Frontend JavaScript tests using Jest
```

## Running Tests

### Run Integration Test (Recommended before deployment)

```bash
./tests/integration-test.sh
```

This test:
- Builds the complete Docker image
- Starts a container with Home Assistant-like environment
- Tests service startup and configuration generation
- Validates that Erbium actually runs without errors
- Checks for missing directories, permission issues, etc.

### Run All Unit Tests

```bash
./tests/run-tests.sh
```

### Run Backend Tests Only

```bash
cd backend
npm install
npm test
```

### Run Frontend Tests Only

```bash
cd frontend
npm install
npm test
```

### Run Shell Script Tests Only

```bash
bats tests/test-config-generation.bats
```

## Test Coverage

### Backend Tests

Tests for the Node.js Express backend server:

- ✓ GET `/api/leases` - Returns DHCP leases
- ✓ GET `/api/dns` - Returns DNS records
- ✓ GET `/api/config` - Returns configuration
- ✓ POST `/api/reload` - Reloads Erbium service
- ✓ Static file serving
- ✓ Error handling

### Frontend Tests

Tests for the frontend JavaScript:

- ✓ `refreshLeases()` - Fetches and displays leases
- ✓ `refreshDNS()` - Fetches and displays DNS records
- ✓ `refreshConfig()` - Fetches and displays configuration
- ✓ `reloadService()` - Reloads the service with confirmation
- ✓ `showError()` - Displays error messages
- ✓ `showSuccess()` - Displays success messages
- ✓ Error handling for network failures

### Shell Script Tests

Tests for configuration generation:

- ✓ Config file creation
- ✓ Log level configuration
- ✓ DNS section generation
- ✓ DHCP section generation
- ✓ TOML format validation

## Continuous Integration

Tests run automatically on GitHub Actions for:

- Every push to `master`, `main`, or `develop` branches
- Every pull request

The CI pipeline includes:

1. **Tests** - Run all unit and integration tests
2. **Linting** - Check code style with shellcheck
3. **Build** - Test Docker image build
4. **Coverage** - Upload coverage reports to Codecov

## Test Dependencies

### Backend
- `jest` - Testing framework
- `supertest` - HTTP assertion library

### Frontend
- `jest` - Testing framework
- `jest-environment-jsdom` - DOM environment for browser-like tests

### Shell Scripts
- `bats` - Bash Automated Testing System

### CI/CD
- Python with PyYAML for config validation
- shellcheck for shell script linting
- Docker for build testing

## Writing New Tests

### Backend Test Example

```javascript
describe('GET /api/endpoint', () => {
    it('should return expected data', async () => {
        const response = await request(app)
            .get('/api/endpoint')
            .expect(200);

        expect(response.body).toEqual(expectedData);
    });
});
```

### Frontend Test Example

```javascript
describe('myFunction', () => {
    it('should do something', async () => {
        global.fetch.mockResolvedValueOnce({
            json: async () => mockData
        });

        await myFunction();

        expect(global.fetch).toHaveBeenCalled();
    });
});
```

### Shell Test Example

```bash
@test "description of test" {
    # Test setup
    variable="value"

    # Run command and verify
    run command_to_test
    [ "$status" -eq 0 ]
    [[ "$output" =~ "expected text" ]]
}
```

## Troubleshooting

### Tests fail locally but pass in CI

- Ensure you have the correct Node.js version (18.x or 20.x)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Bats tests not running

- Install bats: `sudo apt-get install bats` (Debian/Ubuntu)
- Or: `brew install bats-core` (macOS)

### Permission denied on test runner

```bash
chmod +x tests/run-tests.sh
```
