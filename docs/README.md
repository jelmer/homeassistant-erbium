# Documentation

## Table of Contents

- [Installation Guide](INSTALL.md)
- [Configuration Reference](../README.md#configuration)
- [Troubleshooting](INSTALL.md#troubleshooting)

## Screenshots

TODO: Add screenshots of:
- Home Assistant addon page
- Web UI showing DHCP leases
- Web UI showing DNS records
- Configuration screen

## Architecture

```
┌─────────────────────────────────────┐
│    Home Assistant Addon             │
│                                     │
│  ┌──────────┐      ┌─────────────┐ │
│  │  Erbium  │      │   Backend   │ │
│  │  (Rust)  │      │  (Node.js)  │ │
│  │          │      │             │ │
│  │ DNS:53   │      │ HTTP:8099   │ │
│  │ DHCP:67  │      └─────────────┘ │
│  └──────────┘             │        │
│       │                   │        │
└───────┼───────────────────┼────────┘
        │                   │
        │                   └─────► Web UI
        │
        └─────► Network (host_network)
```

## Components

### Erbium Server

The core DNS/DHCP/RA server written in Rust. Handles:
- DNS queries and responses
- DHCP lease management
- Router advertisements (IPv6)

### Backend Service

Node.js/Express server that provides:
- REST API for Web UI
- Access to Erbium state/logs
- Service control endpoints

### Frontend Web UI

HTML/CSS/JavaScript interface for:
- Monitoring DHCP leases
- Viewing DNS records
- Configuration management
- Service control

## Development

### Building Locally

```bash
docker build --build-arg BUILD_FROM=ghcr.io/home-assistant/amd64-base:3.18 -t erbium-addon .
```

### Testing

1. Build the addon locally
2. Install in Home Assistant
3. Configure with test network settings
4. Monitor logs for issues

### Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Known Limitations

- Web UI integration with Erbium state is TODO (currently shows placeholder data)
- Static lease configuration requires manual TOML editing
- No IPv6 DHCP (DHCPv6) support yet (depends on Erbium upstream)
- Icon needs to be replaced with proper graphic

## Future Enhancements

- [ ] Integrate Web UI with Erbium's actual state/database
- [ ] Add DNS zone management through Web UI
- [ ] Static DHCP lease management UI
- [ ] Real-time WebSocket updates for lease changes
- [ ] Prometheus metrics export
- [ ] Backup/restore functionality
- [ ] DNS blocklist/filtering support

## Credits and Attribution

This addon was inspired by and builds upon ideas from several open-source projects:

- **[Erbium](https://github.com/isomer/erbium)** by isomer - The DNS/DHCP server that powers this addon
- **[ha-addon-dnsmasq-dhcp](https://github.com/f18m/ha-addon-dnsmasq-dhcp)** by f18m - Architectural inspiration for this addon's structure and web UI approach
