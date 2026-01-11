#!/usr/bin/env node
/**
 * Erbium Web UI Backend Server
 *
 * Architectural approach inspired by ha-addon-dnsmasq-dhcp by f18m
 * https://github.com/f18m/ha-addon-dnsmasq-dhcp
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = 8099;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// API endpoint to get DHCP leases
app.get('/api/leases', (req, res) => {
    // TODO: Read DHCP leases from Erbium's database/state file
    // For now, return empty array
    res.json([]);
});

// API endpoint to get DNS records
app.get('/api/dns', (req, res) => {
    // TODO: Read DNS records from Erbium's database/state file
    res.json([]);
});

// API endpoint to get configuration
app.get('/api/config', (req, res) => {
    fs.readFile('/config/erbium.toml', 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Failed to read configuration' });
            return;
        }
        res.json({ config: data });
    });
});

// API endpoint to reload Erbium service
app.post('/api/reload', (req, res) => {
    exec('s6-svc -h /var/run/s6/services/erbium', (error, stdout, stderr) => {
        if (error) {
            res.status(500).json({ error: 'Failed to reload service' });
            return;
        }
        res.json({ success: true, message: 'Service reloaded' });
    });
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Only start server if running directly (not imported for testing)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Erbium Web UI listening on port ${PORT}`);
    });
}

// Export app for testing
module.exports = app;
