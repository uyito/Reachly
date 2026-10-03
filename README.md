# Reachly

Reachly is a self-hosted social media scheduling platform based on [Postiz](https://github.com/gitroomhq/postiz-app).

## Development

Use Node.js 22 (>=22.12, <23) and pnpm 10.6.1.

```sh
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev:docker
pnpm exec prisma db push --schema libraries/nestjs-libraries/src/database/prisma/schema.prisma
pnpm dev
```

Set a strong `JWT_SECRET` in `.env`. Development PostgreSQL uses `reachly-local` / `reachly-local-pwd` with database `reachly-db-local`. Redis and Temporal are started by the development Compose file. The frontend runs on port 4200 and the backend on port 3000. Use `STORAGE_PROVIDER="local"` for local development and configure upload directories. Social providers require their own OAuth credentials.

```sh
pnpm build
pnpm build:extension
```

Production Compose builds this checkout as `reachly:local`; it does not deploy the upstream Postiz image. Change example database passwords and configure URLs/secrets before deployment. Set `NEXT_PUBLIC_TERMS_URL`, `NEXT_PUBLIC_PRIVACY_URL`, and optionally `NEXT_PUBLIC_ANALYTICS_DOMAIN`, `NEXT_PUBLIC_EXTENSION_URL`, and `NEXT_PUBLIC_SOURCE_URL`.

The extension is a new Reachly extension, not the published Postiz extension. Build with `FRONTEND_URL` set to your deployment origin and add the same origin to the extension manifest's `externally_connectable.matches` before publishing. Register its new ID in `EXTENSION_ID`. No production domain is assumed.

## License and upstream attribution

Licensed under [GNU AGPL-3.0](LICENSE). Original Postiz copyright and author notices are retained. See [UPSTREAM.md](UPSTREAM.md) for import provenance and compatibility references, and [UPSTREAM_README.md](UPSTREAM_README.md) for the original documentation.

Operators of a modified network deployment must make the corresponding source available under the AGPL. The interface links to this repository; publish the actual deployed source and set `NEXT_PUBLIC_SOURCE_URL` accordingly.
