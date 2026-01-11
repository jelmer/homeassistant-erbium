// Setup for frontend tests
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
};
