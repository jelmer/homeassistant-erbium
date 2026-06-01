ARG BUILD_FROM
FROM ${BUILD_FROM}

# Install build dependencies and runtime requirements
RUN apk add --no-cache \
    curl \
    sqlite-dev \
    build-base \
    git \
    nodejs \
    npm \
    pkgconf

# Install Rust via rustup (Alpine's packaged rust is too old for Erbium,
# which requires edition 2024 / Rust >= 1.85)
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | \
    sh -s -- -y --default-toolchain stable --profile minimal

# Set environment for SQLite dynamic linking (musl tries to static link by default)
ENV RUSTFLAGS="-C target-feature=-crt-static" \
    RUSTSQLITE_SYS_USE_PKG_CONFIG=1

# Set working directory
WORKDIR /tmp/build

# Clone and build Erbium
RUN git clone https://github.com/isomer/erbium.git && \
    cd erbium && \
    cargo build --release && \
    cargo install --path ./crates/erbium --root /usr/local --locked

# Copy backend and install dependencies
COPY backend /backend
WORKDIR /backend
RUN npm install --production

# Copy root filesystem
COPY rootfs /

# Copy frontend
COPY frontend /frontend

# Create Erbium data directory
RUN mkdir -p /var/lib/erbium

# Build permissions
RUN chmod a+x /etc/services.d/*/run /etc/services.d/*/finish

# Set working directory back to root
WORKDIR /

# Expose ports
EXPOSE 53/tcp 53/udp 67/udp 8099/tcp

# Labels
LABEL \
    io.hass.name="Erbium DNS/DHCP Server" \
    io.hass.description="Network services (DNS, DHCP, Router Advertisements) for small/home networks" \
    io.hass.type="addon" \
    io.hass.version="${BUILD_VERSION}" \
    io.hass.arch="${BUILD_ARCH}"
