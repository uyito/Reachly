# Reachly Node.js SDK

This workspace contains the Reachly SDK (`@reachly/node`). It has not been published to npm. Build it locally with `pnpm --filter @reachly/node exec tsup` and use its output in your integration.

```typescript
import Reachly from '@reachly/node';
const reachly = new Reachly('your API key', 'https://your-reachly-host/api');
```

Always supply your deployed Reachly API URL in production. The default is `http://localhost:3000` for development. Supported methods: `post`, `postList`, `upload`, `integrations`, and `deletePost`.

The [upstream API documentation](https://docs.postiz.com/public-api) describes the inherited API.
