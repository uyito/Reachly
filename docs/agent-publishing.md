# Publish from an agent through MCP

Reachly exposes a Streamable HTTP endpoint at `<backend URL>/mcp/agent`. An agent can discover accounts, upload externally generated images or videos, create drafts, schedule posts, publish immediately, and inspect post status without opening the dashboard for each post.

## Connect an agent

1. Connect the social accounts in Reachly.
2. Open **Settings → Agent publishing** as a workspace administrator.
3. Enable each account the agent may publish to. Every existing and new account starts disabled for agent publishing.
4. Create an agent credential and copy it when it is shown. Reachly stores only its SHA-256 hash; the original cannot be retrieved later.
5. Configure the agent's MCP client with the displayed endpoint and `Authorization: Bearer <credential>`.

For example, with a deployment that serves the backend under `/api`:

```json
{
  "mcpServers": {
    "reachly": {
      "url": "https://your-reachly-host/api/mcp/agent",
      "headers": {
        "Authorization": "Bearer <YOUR_AGENT_CREDENTIAL>"
      }
    }
  }
}
```

Use HTTPS in production. The credential belongs to the current workspace and gives access to its media library and opted-in social accounts. It is separate from the general API key and cannot authenticate to the general API or legacy MCP endpoints. Replacing or disconnecting it invalidates the previous credential on the next request, including clients that are already connected.

Existing API-key and OAuth MCP endpoints remain available for integrations that intentionally need general workspace access. The per-account controls on this page apply to the dedicated `/mcp/agent` endpoint. Give autonomous agents the dedicated credential.

## Agent workflow

1. Call `integrationList` to discover healthy accounts currently enabled for agent publishing. Use the returned `id` and `platform`.
2. Call `integrationSchema` with the platform and premium status to learn content, media, and provider settings requirements. Call `triggerTool` if a setting requires provider-specific ids.
3. For externally generated media, call `uploadFromUrlTool` with its public URL. Use the returned hosted `path` in the post's attachments. This preserves Reachly's existing URL validation and upload handling.
4. Call `integrationSchedulePostTool` with a `socialPost` array. Use `type: "schedule"` and an explicit UTC timestamp to schedule, `type: "now"` to publish as soon as possible, or `type: "draft"` to save a draft. Each array entry can target a different enabled account.
5. Inspect the returned post ids and preview URLs. Use `postsListTool` with a UTC date window to monitor queued, published, or errored posts. `postSettingsTool` can update provider settings for an existing draft or future scheduled post on an enabled account.

Example tool arguments for a LinkedIn video post (substitute the real enabled account id and upload result, and follow the account's returned settings schema):

```json
{
  "socialPost": [
    {
      "integrationId": "<ENABLED_ACCOUNT_ID>",
      "isPremium": false,
      "date": "2030-01-01T12:00:00Z",
      "shortLink": false,
      "type": "schedule",
      "postsAndComments": [
        {
          "content": "<p>Our new product video.</p>",
          "attachments": ["https://your-media-host/generated-video.mp4"]
        }
      ],
      "settings": []
    }
  ]
}
```

Reachly does not require a further dashboard approval for posts on enabled accounts. The agent's client can still apply its own approval policy. Successful creation means the post was saved and handed to Reachly's existing publishing workflow, not that a social platform has already accepted it. Normal provider validation, token refresh, and platform errors still apply. The backend and Temporal publishing workers must be running for queued posts to publish.

Disabled, deleted, disconnected, incomplete, and other-workspace accounts cannot be used. All account permissions in a batch are checked before creating its first post. This is not a transaction over external services: validation succeeds before posting, but a later database or worker failure can still partially process a batch. Creation is not idempotent; after a timeout, inspect post history before retrying to avoid duplicates.

Turning off an account or revoking the credential blocks future agent actions. Posts already scheduled remain on the calendar and continue to publish; cancel those in Reachly if needed. Agents cannot manage credentials, enable accounts, or delete posts through this endpoint.

## Deploy and validate

The schema adds nullable `Organization.agentMcpTokenHash` and `Integration.agentPublishingEnabled` with a default of `false`. Apply the repository's schema synchronization workflow before starting the updated backend:

```sh
pnpm exec prisma db push --schema libraries/nestjs-libraries/src/database/prisma/schema.prisma
pnpm prisma-generate
pnpm build:backend
pnpm build:frontend
pnpm test:agent-publishing
```

The focused test suite exercises the real MCP protocol over local HTTP, account and tenant authorization, credential revocation, post creation through the existing scheduling service, and the settings UI. Provider calls and persistence are mocked in that suite; it does not publish to live social accounts.
