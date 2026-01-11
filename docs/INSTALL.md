# Installation Guide

## Prerequisites

- Home Assistant OS or Supervised installation
- Network admin access to disable existing DHCP server
- Understanding of your network configuration

## Step-by-Step Installation

### 1. Add Repository

Add this repository to your Home Assistant addon store:

1. Go to **Settings** → **Add-ons** → **Add-on Store**
2. Click the **⋮** menu (top right) → **Repositories**
3. Add this repository URL
4. Click **Add**

### 2. Install the Addon

1. Find "Erbium DNS/DHCP Server" in the addon store
2. Click on it
3. Click **Install**
4. Wait for the installation to complete

### 3. Configure the Addon

Before starting, configure the addon:

1. Go to the **Configuration** tab
2. Adjust settings to match your network:
   - Set `dhcp_range_start` and `dhcp_range_end` to match your subnet
   - Set `gateway` to your network gateway (usually your router's IP)
   - Configure `dns_servers` for upstream DNS resolution
   - Adjust other options as needed

Example configuration:
```yaml
dns_enabled: true
dhcp_enabled: true
domain: "home.local"
dhcp_range_start: "192.168.1.100"
dhcp_range_end: "192.168.1.200"
gateway: "192.168.1.1"
dns_servers:
  - "1.1.1.1"
  - "8.8.8.8"
```

### 4. Disable Existing DHCP Server

**Important**: You must disable your router's DHCP server to avoid conflicts.

This varies by router, but generally:
1. Log into your router's admin interface
2. Find DHCP settings (usually under LAN or Network settings)
3. Disable DHCP server
4. Save changes
5. Reboot router if necessary

### 5. Start the Addon

1. Go to the **Info** tab
2. Click **Start**
3. Enable **Start on boot** if desired
4. Enable **Watchdog** to auto-restart on failures

### 6. Verify Operation

1. Check the **Log** tab for any errors
2. Access the Web UI at `http://homeassistant.local:8099`
3. Connect a test device and verify it gets an IP address
4. Check the Web UI for the new DHCP lease

## Post-Installation

### Configure DNS on Client Devices

For DNS resolution to work, clients need to use this server. This happens automatically via DHCP, but for static IP devices:

1. Set DNS server to your Home Assistant IP address
2. Test with: `nslookup hostname.home.local <homeassistant-ip>`

### Static DHCP Leases

To configure static IP assignments by MAC address, use the `custom_config` option:

```toml
[[dhcp.static_leases]]
mac = "aa:bb:cc:dd:ee:ff"
ip = "192.168.1.50"
hostname = "printer"
```

## Troubleshooting

### No DHCP leases being assigned

1. Verify router's DHCP is disabled
2. Check addon logs for errors
3. Ensure `host_network: true` in config
4. Verify DHCP range matches your subnet

### DNS not resolving

1. Check clients are using the correct DNS server
2. Verify DNS is enabled in addon config
3. Check port 53 isn't blocked
4. Review addon logs

### Web UI not accessible

1. Check port 8099 isn't blocked
2. Try accessing via IP: `http://<homeassistant-ip>:8099`
3. Check backend service logs

## Uninstallation

To remove the addon:

1. **Re-enable your router's DHCP server first**
2. Stop the addon
3. Uninstall the addon
4. Reboot client devices to get new DHCP leases from router

---

**Credits**: This addon is powered by [Erbium](https://github.com/isomer/erbium) by isomer. Architecture inspired by [ha-addon-dnsmasq-dhcp](https://github.com/f18m/ha-addon-dnsmasq-dhcp) by f18m.
