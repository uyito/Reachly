# Development and validation status

- Reachly imports Postiz source at `ce9cb27a6aa8c400b6d6ff4f79a066ee408592df`; original license and author notices are preserved.
- Node 22.22.0 and pnpm 10.6.1 are installed in `/workspace/.reachly-tools`. Activate both with `export PATH=/workspace/.reachly-tools/node_modules/node/bin:/workspace/.reachly-tools/node_modules/.bin:$PATH`.
- Frozen dependency installation and Prisma generation now pass. The earlier Prisma network restriction is resolved, with checksum verification enabled.
- Development PostgreSQL is running. Schema synchronization passed. The agent publishing permission defaults to false; hashed credential storage, revocation, and tenant isolation were verified against PostgreSQL using temporary records that were deleted after the checks.
- Backend and frontend type checks and production builds pass.
- `pnpm test:agent-publishing`: 53 tests pass, covering the real MCP protocol over local HTTP, media post creation through the scheduling service, account and tenant authorization, revocation, administrator permissions, and the settings UI. Social provider calls and persistence in the focused suite are mocked; separate persistence checks used PostgreSQL.
- The frontend sanitizer uses Next.js's supported `serverExternalPackages` setting so jsdom can load its installed stylesheet during production rendering. Native sanitization was checked to preserve content while removing script tags and event handlers.
- The production frontend started successfully and rendered `/auth/login` with HTTP 200 and Reachly content.
- The extension build and Docker Compose configuration checks passed during import.
- The inherited general Jest configuration still imports undeclared `@nx/jest`. No tests from that runner ran; use the focused agent publishing test command for this feature.
- Live social publishing has not been tested. It requires connected provider accounts, the backend, Redis, and Temporal publishing workers. See [agent publishing setup](docs/agent-publishing.md).

The schema change has been applied to this local development database. Apply it to each deployment before starting the new backend. Configure your Reachly domain, legal policy URLs, extension listing, social OAuth credentials, and source-code URL before deployment.
