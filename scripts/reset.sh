#!/usr/bin/env bash
set -euo pipefail
# Available once Feature A implements reset. Failure is explicit in the scaffold.
curl --fail --silent --show-error -X POST http://127.0.0.1:8787/api/reset \
  -H 'Content-Type: application/json' -d '{}'
