# Changelog

## [0.1.1] - 2026-11-17

### Added

- LICENSE file (Apache-2.0).
- "Add to Home Assistant" button in README for easier installation.

### Changed

- Build Erbium with the stable Rust toolchain instead of nightly, fixing
  Docker builds that required edition 2024.

## [0.1.0] - 2025-06-01

### Added

- Initial release
- DNS server with upstream forwarding
- DHCP server with configurable IP range and lease time
- IPv6 Router Advertisement support
- Web UI for monitoring DHCP leases and DNS records
- Configuration through Home Assistant UI or custom TOML config
- Support for amd64 and aarch64 architectures
- GitHub Container Registry image publishing
- Integration test for runtime validation
