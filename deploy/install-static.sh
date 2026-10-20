#!/usr/bin/env bash
set -euo pipefail
if [[ $EUID -ne 0 ]]; then echo 'Run with sudo.' >&2; exit 1; fi
archive=${1:?Pass built static archive}
stamp=$(date -u +%Y%m%dT%H%M%SZ)
release="/opt/catplant/releases/$stamp"
install -d -m 755 "$release"
tar -xzf "$archive" -C "$release"
# Keep hashed assets requested by pages opened before a release switch.
for old_assets in /opt/catplant/releases/*/assets; do
    if [[ -d $old_assets && $old_assets != "$release/assets" ]]; then
        cp -an "$old_assets/." "$release/assets/"
    fi
done
chmod -R a+rX "$release"
previous=$(readlink /opt/catplant/current || true)
backup="/etc/caddy/Caddyfile.pre-catplant-$stamp"
cp -p /etc/caddy/Caddyfile "$backup"
config=$(mktemp)
trap 'rm -f "$config"' EXIT
python3 - "$config" <<'PY'
import sys
s=open('/etc/caddy/Caddyfile').read()
if 'handle_path /catplant/*' not in s:
    marker='    handle {'
    if s.count(marker)!=1: raise SystemExit('Expected one fallback route; inspect Caddy configuration.')
    block='''    redir /catplant /catplant/ 308
    handle_path /catplant/* {
        root * /opt/catplant/current
        file_server
    }

'''
    s=s.replace(marker,block+marker)
route='        root * /opt/catplant/current'
if 'header Cache-Control "no-cache"' not in s:
    s=s.replace(route,route+'\n        header Cache-Control "no-cache"')
open(sys.argv[1],'w').write(s)
PY
caddy validate --config "$config" --adapter caddyfile
ln -s "$release" /opt/catplant/current.next
mv -Tf /opt/catplant/current.next /opt/catplant/current
install -m 644 "$config" /etc/caddy/Caddyfile
if ! systemctl reload caddy; then
    cp -p "$backup" /etc/caddy/Caddyfile
    if [[ -n $previous ]]; then ln -s "$previous" /opt/catplant/rollback; mv -Tf /opt/catplant/rollback /opt/catplant/current; fi
    systemctl reload caddy
    exit 1
fi
printf 'Installed %s\nProxy backup: %s\n' "$release" "$backup"
