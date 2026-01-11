/**
 * Frontend JavaScript Tests
 */

// Load the app.js code
const fs = require('fs');
const path = require('path');
const appCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// Create a context to execute the app code in
let refreshLeases, refreshDNS, refreshConfig, reloadService, showError, showSuccess, showTab;

describe('Frontend App Functions', () => {
    beforeEach(() => {
        // Set up DOM
        document.body.innerHTML = `
            <div class="container">
                <main>
                    <div id="dhcp-tab" class="tab-content active">
                        <table id="leases-table">
                            <tbody id="leases-tbody"></tbody>
                        </table>
                    </div>
                    <div id="dns-tab" class="tab-content">
                        <table id="dns-table">
                            <tbody id="dns-tbody"></tbody>
                        </table>
                    </div>
                    <div id="config-tab" class="tab-content">
                        <pre id="config-display"></pre>
                    </div>
                </main>
            </div>
            <div class="tabs">
                <button class="tab-button active">DHCP</button>
                <button class="tab-button">DNS</button>
                <button class="tab-button">Config</button>
            </div>
        `;

        // Execute the app code directly to define functions globally
        // Use indirect eval to execute in global scope
        (1, eval)(appCode);

        // Functions are now defined in global scope
        refreshLeases = window.refreshLeases;
        refreshDNS = window.refreshDNS;
        refreshConfig = window.refreshConfig;
        reloadService = window.reloadService;
        showError = window.showError;
        showSuccess = window.showSuccess;
        showTab = window.showTab;

        // Reset fetch mock
        global.fetch.mockClear();
    });

    describe('refreshLeases', () => {
        it('should fetch and display leases', async () => {
            const mockLeases = [
                {
                    ip: '192.168.1.100',
                    mac: 'aa:bb:cc:dd:ee:ff',
                    hostname: 'test-device',
                    expires: new Date().toISOString(),
                    active: true
                }
            ];

            global.fetch.mockResolvedValueOnce({
                json: async () => mockLeases
            });

            await refreshLeases();

            expect(global.fetch).toHaveBeenCalledWith('/api/leases');
            const tbody = document.getElementById('leases-tbody');
            expect(tbody.innerHTML).toContain('192.168.1.100');
            expect(tbody.innerHTML).toContain('aa:bb:cc:dd:ee:ff');
            expect(tbody.innerHTML).toContain('test-device');
        });

        it('should display "No active leases" when empty', async () => {
            global.fetch.mockResolvedValueOnce({
                json: async () => []
            });

            await refreshLeases();

            const tbody = document.getElementById('leases-tbody');
            expect(tbody.innerHTML).toContain('No active leases');
        });

        it('should handle fetch errors gracefully', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            await refreshLeases();

            expect(console.error).toHaveBeenCalledWith(
                'Failed to fetch leases:',
                expect.any(Error)
            );
        });
    });

    describe('refreshDNS', () => {
        it('should fetch and display DNS records', async () => {
            const mockRecords = [
                {
                    domain: 'test.local',
                    type: 'A',
                    value: '192.168.1.10'
                }
            ];

            global.fetch.mockResolvedValueOnce({
                json: async () => mockRecords
            });

            await refreshDNS();

            expect(global.fetch).toHaveBeenCalledWith('/api/dns');
            const tbody = document.getElementById('dns-tbody');
            expect(tbody.innerHTML).toContain('test.local');
            expect(tbody.innerHTML).toContain('192.168.1.10');
        });

        it('should display "No DNS records" when empty', async () => {
            global.fetch.mockResolvedValueOnce({
                json: async () => []
            });

            await refreshDNS();

            const tbody = document.getElementById('dns-tbody');
            expect(tbody.innerHTML).toContain('No DNS records');
        });
    });

    describe('refreshConfig', () => {
        it('should fetch and display configuration', async () => {
            const mockConfig = 'log_level = "info"\n[dns]\nenabled = true';

            global.fetch.mockResolvedValueOnce({
                json: async () => ({ config: mockConfig })
            });

            await refreshConfig();

            expect(global.fetch).toHaveBeenCalledWith('/api/config');
            const display = document.getElementById('config-display');
            expect(display.textContent).toBe(mockConfig);
        });

        it('should handle fetch errors', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            await refreshConfig();

            const display = document.getElementById('config-display');
            expect(display.textContent).toBe('Failed to load configuration');
        });
    });

    describe('reloadService', () => {
        beforeEach(() => {
            // Mock window.confirm
            global.confirm = jest.fn();
        });

        it('should reload service when confirmed', async () => {
            global.confirm.mockReturnValueOnce(true);
            global.fetch.mockResolvedValueOnce({
                json: async () => ({ success: true, message: 'Service reloaded' })
            });

            await reloadService();

            expect(global.confirm).toHaveBeenCalledWith(
                'Are you sure you want to reload the Erbium service?'
            );
            expect(global.fetch).toHaveBeenCalledWith('/api/reload', {
                method: 'POST'
            });
        });

        it('should not reload if not confirmed', async () => {
            global.confirm.mockReturnValueOnce(false);

            await reloadService();

            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should handle reload errors', async () => {
            global.confirm.mockReturnValueOnce(true);
            global.fetch.mockRejectedValueOnce(new Error('Network error'));

            await reloadService();

            expect(console.error).toHaveBeenCalledWith(
                'Failed to reload service:',
                expect.any(Error)
            );
        });
    });

    describe('showError', () => {
        it('should display error message', () => {
            showError('Test error message');

            const errorDiv = document.querySelector('.error');
            expect(errorDiv).not.toBeNull();
            expect(errorDiv.textContent).toBe('Test error message');
        });

        it('should remove error message after 5 seconds', () => {
            // Clear any existing error divs first
            document.querySelectorAll('.error').forEach(el => el.remove());

            jest.useFakeTimers();

            showError('Test error');

            let errorDiv = document.querySelector('.error');
            expect(errorDiv).not.toBeNull();
            expect(errorDiv.textContent).toBe('Test error');

            // Fast forward time by 5000ms
            jest.advanceTimersByTime(5000);

            // Error div should be removed
            expect(document.querySelector('.error')).toBeNull();

            jest.useRealTimers();
        });
    });

    describe('showSuccess', () => {
        it('should display success message', () => {
            showSuccess('Test success message');

            const successDiv = document.querySelector('.success');
            expect(successDiv).not.toBeNull();
            expect(successDiv.textContent).toBe('Test success message');
        });
    });
});
