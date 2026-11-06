#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Build locally and upload out/ to the shared host.
#
# The build runs here, not on the server: `next build` needs more memory than
# a shared plan allows, and the host only ever has to serve files.
#
# Usage:  npm run deploy            # build + upload
#         npm run deploy -- --dry   # show what would change, upload nothing
#         npm run deploy -- --skip-build
#
# Config lives in .env.deploy (gitignored). See .env.deploy.example.
# -----------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."

DRY=0
SKIP_BUILD=0
for arg in "$@"; do
  case "$arg" in
    --dry) DRY=1 ;;
    --skip-build) SKIP_BUILD=1 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

if [[ ! -f .env.deploy ]]; then
  echo "missing .env.deploy — copy .env.deploy.example and fill it in" >&2
  exit 1
fi
# shellcheck disable=SC1091
source .env.deploy

: "${REMOTE_HOST:?set REMOTE_HOST in .env.deploy}"
: "${REMOTE_PATH:?set REMOTE_PATH in .env.deploy}"
: "${NEXT_PUBLIC_SITE_URL:?set NEXT_PUBLIC_SITE_URL in .env.deploy}"
export NEXT_PUBLIC_SITE_URL

if [[ "$SKIP_BUILD" -eq 0 ]]; then
  echo "▸ building for ${NEXT_PUBLIC_SITE_URL}"
  rm -rf out
  npm run build
fi

[[ -f out/index.html || -d out/fa ]] || { echo "out/ looks wrong — aborting" >&2; exit 1; }

# config.php holds the bot token and is never in the build. Protect the copy
# already on the server from being deleted by --delete.
EXCLUDES=(--exclude 'api/config.php')

if [[ "${REMOTE_METHOD:-rsync}" == "rsync" ]]; then
  : "${REMOTE_USER:?set REMOTE_USER}"
  FLAGS=(-az --delete --checksum --human-readable "${EXCLUDES[@]}")
  [[ "$DRY" -eq 1 ]] && FLAGS+=(--dry-run --itemize-changes)
  [[ -n "${REMOTE_PORT:-}" ]] && FLAGS+=(-e "ssh -p ${REMOTE_PORT}")
  echo "▸ rsync → ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"
  rsync "${FLAGS[@]}" out/ "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"
else
  # FTP fallback for cPanel plans without SSH.
  command -v lftp >/dev/null || { echo "lftp is not installed" >&2; exit 1; }
  : "${REMOTE_USER:?set REMOTE_USER}"
  : "${REMOTE_PASS:?set REMOTE_PASS}"
  MIRROR_FLAGS="--reverse --delete --parallel=4 --exclude-glob api/config.php"
  [[ "$DRY" -eq 1 ]] && MIRROR_FLAGS="$MIRROR_FLAGS --dry-run"
  echo "▸ lftp → ${REMOTE_HOST}:${REMOTE_PATH}"
  lftp -c "
    set ssl:verify-certificate no;
    set ftp:ssl-allow ${FTP_SSL:-true};
    open -u '${REMOTE_USER}','${REMOTE_PASS}' '${REMOTE_HOST}';
    mirror ${MIRROR_FLAGS} out/ '${REMOTE_PATH}';
  "
fi

if [[ "$DRY" -eq 1 ]]; then
  echo "▸ dry run — nothing was uploaded"
else
  echo "▸ done. Check ${NEXT_PUBLIC_SITE_URL}/ and ${NEXT_PUBLIC_SITE_URL}/sitemap.xml"
fi
