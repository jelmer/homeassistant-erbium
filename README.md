# Erbium DNS/DHCP Server - Home Assistant Addon

![Tests](https://github.com/jelmer/homeassistant-erbium/workflows/Tests/badge.svg)
[![codecov](https://codecov.io/gh/jelmer/homeassistant-erbium/branch/master/graph/badge.svg)](https://codecov.io/gh/jelmer/homeassistant-erbium)

A Home Assistant addon for running [Erbium](https://github.com/isomer/erbium), a modern DNS, DHCP, and Router Advertisement server written in Rust for small and home networks.

## Features

- DNS server for your local network
- DHCP server with automatic IP address assignment
- IPv6 router advertisement support
- Web interface for monitoring DHCP leases and DNS records
- Configuration through Home Assistant UI or custom TOML config

## Installation

1. Add this repository to your Home Assistant addon store
2. Install the "Erbium DNS/DHCP Server" addon
3. Configure the addon options
4. Start the addon

## Configuration

### Basic Options

| Option | Description | Default |
|--------|-------------|---------|
| `dns_enabled` | Enable DNS server | `true` |
| `dhcp_enabled` | Enable DHCP server | `true` |
| `router_advertisements_enabled` | Enable Router Advertisements | `false` |
| `domain` | Local domain name | `local` |
| `dns_port` | DNS server port | `53` |
| `dhcp_range_start` | DHCP range start IP | `192.168.1.100` |
| `dhcp_range_end` | DHCP range end IP | `192.168.1.200` |
| `dhcp_lease_time` | DHCP lease duration | `12h` |
| `gateway` | Default gateway IP | `192.168.1.1` |
| `dns_servers` | Upstream DNS servers | `["8.8.8.8", "8.8.4.4"]` |
| `log_level` | Logging level | `info` |
| `custom_config` | Additional TOML configuration | (optional) |

### Example Configuration

```yaml
dns_enabled: true
dhcp_enabled: true
router_advertisements_enabled: false
domain: "home.local"
dns_port: 53
dhcp_range_start: "192.168.1.100"
dhcp_range_end: "192.168.1.200"
dhcp_lease_time: "24h"
gateway: "192.168.1.1"
dns_servers:
  - "1.1.1.1"
  - "8.8.8.8"
log_level: "info"
```

### Advanced Configuration

For advanced users, you can provide custom configuration in the `custom_config` option. This will be appended to the auto-generated configuration file (which uses Erbium's YAML-based format — see [Erbium docs](https://github.com/isomer/erbium) for details).

## Network Requirements

This addon requires `host_network: true` to properly handle DHCP and DNS requests. This means:

- The addon shares the host's network stack
- DNS runs on port 53 (UDP/TCP)
- DHCP runs on port 67 (UDP)
- Web UI runs on port 8099 (TCP)

Make sure these ports are not in use by other services on your Home Assistant host.

## Web UI

Access the web UI at: `http://homeassistant.local:8099` (or your Home Assistant IP address)

The web UI provides:
- Real-time DHCP lease monitoring
- DNS record viewing
- Configuration viewing
- Service reload capability

## Important Notes

⚠️ **Network Impact**: This addon provides DHCP services. Make sure to:
- Disable any existing DHCP servers on your network (usually your router)
- Configure the DHCP range to avoid conflicts with static IPs
- Test in a controlled environment first

⚠️ **Development Status**: Erbium is in beta. While functional, it may have bugs or missing features.

## Troubleshooting

### DHCP not working

1. Ensure no other DHCP server is running on your network
2. Check that `host_network: true` is set
3. Verify the DHCP range matches your network subnet
4. Check addon logs for errors

### DNS not resolving

1. Ensure port 53 is not in use by another service
2. Configure your devices to use the Home Assistant IP as their DNS server
3. Check DNS is enabled in the addon configuration

### Web UI not accessible

1. Ensure port 8099 is not blocked by your firewall
2. Try accessing via IP address instead of hostname
3. Check backend service logs

## Development

See [tests/README.md](tests/README.md) for how to run the test suite.

## License

Apache 2.0

## Credits

- [Erbium](https://github.com/isomer/erbium) by isomer - The DNS/DHCP server that powers this addon
- [ha-addon-dnsmasq-dhcp](https://github.com/f18m/ha-addon-dnsmasq-dhcp) by f18m - Architectural inspiration
