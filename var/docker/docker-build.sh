#!/usr/bin/env bash
set -euo pipefail
docker build -t reachly:local -f Dockerfile.dev .
