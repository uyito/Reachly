#!/usr/bin/env bash
set -euo pipefail
docker create --name reachly -p 3000:3000 -p 4200:4200 reachly:local
