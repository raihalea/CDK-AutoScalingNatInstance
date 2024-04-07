FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y nftables && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY nftables.conf /etc/nftables.conf

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]