# Deployment

## Static hosting

Build for a domain root:

```sh
npm ci
npm run build
```

Upload the contents of `dist/` to a static host. For a subpath, set the asset base at build time:

```sh
npm run build -- --base=/catplant/
```

Serve that build at `/catplant/`. The public demo uses this layout. Keep the trailing slash and redirect `/catplant` to `/catplant/`.

## Docker and Nginx

```sh
docker compose up -d --build
```

The multi-stage image builds with Node.js and serves only the generated files using Nginx. Compose defaults to loopback port 8080. Put an HTTPS reverse proxy in front of it, for example:

```caddyfile
catplant.example.com {
    reverse_proxy 127.0.0.1:8080
}
```

`CATPLANT_PORT` changes the host port and `CATPLANT_BIND` changes the bind address. For direct access on a trusted development server:

```sh
CATPLANT_BIND=0.0.0.0 docker compose up -d --build
```

Configure the firewall as appropriate. This direct HTTP configuration does not itself provide TLS. The Docker path builds for `/`; use the static subpath flow for the shared Caddy configuration below. Docker is supplied as a hosting option and has not been tested in the current development environment.

## Existing shared Caddy server

The optional installer assumes Linux, root access, an existing Caddy service, and an existing Caddyfile with exactly one fallback `handle` block. It is a specific deployment helper, not a general-purpose server provisioning tool. Review it before running it on your server.

Prepare an archive locally:

```sh
npm ci
npm run build -- --base=/catplant/
tar -czf /tmp/catplant-static.tar.gz -C dist .
```

Upload the archive and `deploy/install-static.sh` using your own SSH connection. On the server:

```sh
sudo bash install-static.sh /path/to/catplant-static.tar.gz
```

The installer:

1. Extracts a timestamped release into `/opt/catplant/releases/`.
2. Copies earlier hashed assets into the release so cached pages can still request them.
3. Backs up `/etc/caddy/Caddyfile`.
4. Adds a `/catplant/` static route if absent, preserving other routes and existing global options.
5. Sets revalidation for game responses and validates the proposed Caddyfile.
6. Switches `/opt/catplant/current` atomically and reloads Caddy.
7. Restores the old proxy configuration and previous release if the reload fails.

The installer does not provide a full post-deployment health-check rollback, remove old releases, provision certificates separately, or manage application data. Operators should verify the public page and asset URLs, then remove old releases according to their retention needs. Earlier assets are intentionally retained; disk use grows across deployments.

Example route for a manually managed configuration:

```caddyfile
example.com {
    redir /catplant /catplant/ 308
    handle_path /catplant/* {
        root * /opt/catplant/current
        header Cache-Control "no-cache"
        file_server
    }
    # Retain your other routes here.
}
```

## Verification and rollback

Check the page, JavaScript, CSS, and scenery URLs after every deployment. Also confirm that any other application sharing the proxy remains available. A working server response does not prove that a particular browser or network can connect; reproduce client errors before declaring them resolved.

To roll back, point `/opt/catplant/current` at a known-good release with a temporary symlink followed by an atomic rename. Restore the matching Caddyfile backup if routing also changed, validate it, then reload Caddy. Keep the current configuration backed up before changing it.

## Browser saves and privacy

Progress is stored by browser origin, not on the VPS. Moving to another domain or browser does not transfer saves. Do not delete site storage as a routine connection troubleshooting step if you want to preserve the garden.

SSH identities, private keys, environment files, server logs, local hosting metadata, and release archives do not belong in this repository. Public demo URLs are safe to share; deployment authentication stays with the operator.
