// Tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');

    // Load data for the tab
    if (tabName === 'dhcp') {
        refreshLeases();
    } else if (tabName === 'dns') {
        refreshDNS();
    } else if (tabName === 'config') {
        refreshConfig();
    }
}

// Fetch and display DHCP leases
async function refreshLeases() {
    try {
        const response = await fetch('/api/leases');
        const leases = await response.json();

        const tbody = document.getElementById('leases-tbody');

        if (leases.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No active leases</td></tr>';
            return;
        }

        tbody.innerHTML = leases.map(lease => `
            <tr>
                <td>${lease.ip}</td>
                <td>${lease.mac}</td>
                <td>${lease.hostname || '-'}</td>
                <td>${new Date(lease.expires).toLocaleString()}</td>
                <td><span class="status ${lease.active ? 'active' : 'expired'}">${lease.active ? 'Active' : 'Expired'}</span></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to fetch leases:', error);
        showError('Failed to load DHCP leases');
    }
}

// Fetch and display DNS records
async function refreshDNS() {
    try {
        const response = await fetch('/api/dns');
        const records = await response.json();

        const tbody = document.getElementById('dns-tbody');

        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="no-data">No DNS records</td></tr>';
            return;
        }

        tbody.innerHTML = records.map(record => `
            <tr>
                <td>${record.domain}</td>
                <td>${record.type}</td>
                <td>${record.value}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Failed to fetch DNS records:', error);
        showError('Failed to load DNS records');
    }
}

// Fetch and display configuration
async function refreshConfig() {
    try {
        const response = await fetch('/api/config');
        const data = await response.json();

        document.getElementById('config-display').textContent = data.config;
    } catch (error) {
        console.error('Failed to fetch configuration:', error);
        document.getElementById('config-display').textContent = 'Failed to load configuration';
    }
}

// Reload Erbium service
async function reloadService() {
    if (!confirm('Are you sure you want to reload the Erbium service?')) {
        return;
    }

    try {
        const response = await fetch('/api/reload', { method: 'POST' });
        const result = await response.json();

        if (result.success) {
            showSuccess('Service reloaded successfully');
        } else {
            showError('Failed to reload service');
        }
    } catch (error) {
        console.error('Failed to reload service:', error);
        showError('Failed to reload service');
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;

    const main = document.querySelector('main');
    main.insertBefore(errorDiv, main.firstChild);

    setTimeout(() => errorDiv.remove(), 5000);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;

    const main = document.querySelector('main');
    main.insertBefore(successDiv, main.firstChild);

    setTimeout(() => successDiv.remove(), 5000);
}

// Auto-refresh every 30 seconds for active tab
setInterval(() => {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab.id === 'dhcp-tab') {
        refreshLeases();
    } else if (activeTab.id === 'dns-tab') {
        refreshDNS();
    }
}, 30000);

// Initial load
refreshLeases();
