# Tests

Run all tests:

```bash
./tests/run-tests.sh
```

Or run individual test suites:

```bash
cd backend && npm test        # Backend API tests
cd frontend && npm test       # Frontend tests
bats tests/test-config-generation.bats  # Shell tests
```
