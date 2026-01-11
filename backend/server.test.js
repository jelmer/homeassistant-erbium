const request = require('supertest');
const fs = require('fs');
const fsReal = jest.requireActual('fs');
const path = require('path');
const { exec } = require('child_process');
const express = require('express');

// Mock child_process before requiring the app
jest.mock('child_process');

// Mock express.static to avoid file system access
jest.mock('express', () => {
    const actualExpress = jest.requireActual('express');
    return Object.assign(
        (...args) => actualExpress(...args),
        actualExpress,
        {
            static: jest.fn(() => (req, res, next) => next())
        }
    );
});

// Setup test HTML file
beforeAll(() => {
    const frontendDir = path.join(__dirname, '../frontend');
    const indexPath = path.join(frontendDir, 'index.html');

    // Create frontend directory and index.html for testing
    if (!fsReal.existsSync(frontendDir)) {
        fsReal.mkdirSync(frontendDir, { recursive: true });
    }
    if (!fsReal.existsSync(indexPath)) {
        fsReal.writeFileSync(indexPath, '<!DOCTYPE html><html><body>Test HTML</body></html>');
    }
});

const app = require('./server');

// Close any open handles after tests
afterAll(() => {
    return new Promise((resolve) => {
        setTimeout(resolve, 500);
    });
});

describe('Erbium Backend API', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/leases', () => {
        it('should return an empty array of leases', async () => {
            const response = await request(app)
                .get('/api/leases')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toEqual([]);
        });
    });

    describe('GET /api/dns', () => {
        it('should return an empty array of DNS records', async () => {
            const response = await request(app)
                .get('/api/dns')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toEqual([]);
        });
    });

    describe('GET /api/config', () => {
        beforeEach(() => {
            // Mock fs.readFile for config tests
            jest.spyOn(fs, 'readFile');
        });

        afterEach(() => {
            fs.readFile.mockRestore();
        });

        it('should return configuration when file exists', async () => {
            const mockConfig = 'log_level = "info"\n[dns]\nenabled = true';

            fs.readFile.mockImplementation((path, encoding, callback) => {
                callback(null, mockConfig);
            });

            const response = await request(app)
                .get('/api/config')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toEqual({ config: mockConfig });
            expect(fs.readFile).toHaveBeenCalledWith(
                '/config/erbium.toml',
                'utf8',
                expect.any(Function)
            );
        });

        it('should return error when config file cannot be read', async () => {
            fs.readFile.mockImplementation((path, encoding, callback) => {
                callback(new Error('File not found'));
            });

            const response = await request(app)
                .get('/api/config')
                .expect('Content-Type', /json/)
                .expect(500);

            expect(response.body).toEqual({ error: 'Failed to read configuration' });
        });
    });

    describe('POST /api/reload', () => {
        it('should successfully reload the service', async () => {
            exec.mockImplementation((command, callback) => {
                callback(null, '', '');
            });

            const response = await request(app)
                .post('/api/reload')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: 'Service reloaded'
            });
            expect(exec).toHaveBeenCalledWith(
                's6-svc -h /var/run/s6/services/erbium',
                expect.any(Function)
            );
        });

        it('should return error when reload fails', async () => {
            exec.mockImplementation((command, callback) => {
                callback(new Error('Command failed'));
            });

            const response = await request(app)
                .post('/api/reload')
                .expect('Content-Type', /json/)
                .expect(500);

            expect(response.body).toEqual({ error: 'Failed to reload service' });
        });
    });

    describe('GET / (catch-all route)', () => {
        it('should serve the frontend HTML file', async () => {
            const response = await request(app)
                .get('/');

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/html/);
            expect(response.text).toContain('html');
        });

        it('should serve the catch-all route for unknown paths', async () => {
            const response = await request(app)
                .get('/some/random/path');

            expect(response.status).toBe(200);
            expect(response.type).toMatch(/html/);
            expect(response.text).toContain('html');
        });
    });
});
