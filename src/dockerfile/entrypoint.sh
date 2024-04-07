#!/bin/bash
set -e

nft -f /etc/nftables.conf

exec "$@"
