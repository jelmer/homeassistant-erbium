# Documentation

- [Installation Guide](INSTALL.md)
- [Configuration Reference](../README.md#configuration)
- [Troubleshooting](INSTALL.md#troubleshooting)

## Architecture

The addon runs two services via s6:

- **Erbium** (Rust) — the DNS/DHCP/RA server, listening on ports 53 and 67
- **Backend** (Node.js/Express) — serves the web UI and REST API on port 8099

Both run on the host network (`host_network: true`).

## Known Limitations

- Web UI integration with Erbium state is TODO (currently shows placeholder data)
- Static lease configuration requires manual editing of the config
- No IPv6 DHCP (DHCPv6) support yet (depends on Erbium upstream)

## Credits

- [Erbium](https://github.com/isomer/erbium) by isomer
- [ha-addon-dnsmasq-dhcp](https://github.com/f18m/ha-addon-dnsmasq-dhcp) by f18m — architectural inspiration
