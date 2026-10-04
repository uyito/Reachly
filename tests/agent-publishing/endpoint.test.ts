import 'reflect-metadata';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import express from 'express';
import type { Server } from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { RequestContext } from '@mastra/core/request-context';
import { startAgentMcp } from '../../libraries/nestjs-libraries/src/chat/start.agent-mcp';
import { OrganizationService } from '../../libraries/nestjs-libraries/src/database/prisma/organizations/organization.service';
import { IntegrationService } from '../../libraries/nestjs-libraries/src/database/prisma/integrations/integration.service';
import { IntegrationRepository } from '../../libraries/nestjs-libraries/src/database/prisma/integrations/integration.repository';
import { PostsService } from '../../libraries/nestjs-libraries/src/database/prisma/posts/posts.service';
import { IntegrationListTool } from '../../libraries/nestjs-libraries/src/chat/tools/integration.list.tool';
import { IntegrationSchedulePostTool } from '../../libraries/nestjs-libraries/src/chat/tools/integration.schedule.post';
import { PostsListTool } from '../../libraries/nestjs-libraries/src/chat/tools/posts.list.tool';
import { PostSettingsTool } from '../../libraries/nestjs-libraries/src/chat/tools/post.settings.tool';
import { UploadFromUrlTool } from '../../libraries/nestjs-libraries/src/chat/tools/upload.from.url.tool';
import { IntegrationTriggerTool } from '../../libraries/nestjs-libraries/src/chat/tools/integration.trigger.tool';
import { IntegrationValidationTool } from '../../libraries/nestjs-libraries/src/chat/tools/integration.validation.tool';
import { runWithContext } from '../../libraries/nestjs-libraries/src/chat/async.storage';
import { hashAgentMcpToken } from '../../libraries/nestjs-libraries/src/chat/agent-publishing.policy';

vi.mock('@reachly/nestjs-libraries/redis/redis.service', () => ({
  ioRedis: {},
}));
vi.mock('@reachly/nestjs-libraries/upload/upload.factory', () => ({
  UploadFactory: { createStorage: () => ({}) },
}));
vi.mock('@sentry/nestjs', () => ({ metrics: { count: vi.fn() } }));

const org = { id: 'workspace-a' };
const makeChannel = (
  id: string,
  enabled: boolean,
  organizationId = org.id
) => ({
  id,
  organizationId,
  name: id,
  providerIdentifier: 'linkedin',
  picture: null,
  disabled: false,
  deletedAt: null,
  refreshNeeded: false,
  inBetweenSteps: false,
  agentPublishingEnabled: enabled,
  customer: null,
});
let channels: ReturnType<typeof makeChannel>[];
let tokenHash: string | null;
let token: string;
let base: string;
let server: Server;
const clients: Client[] = [];
const setHash = vi.fn(async (_orgId: string, hash: string | null) => {
  tokenHash = hash;
});
const organizations = new OrganizationService(
  {
    setAgentMcpTokenHash: setHash,
    getOrgByAgentMcpTokenHash: async (hash: string) =>
      hash === tokenHash ? org : null,
    hasAgentMcpToken: async () => !!tokenHash,
  } as any,
  {} as any
);

const integrations = Object.assign(
  Object.create(IntegrationService.prototype),
  {
    _integrationRepository: {
      getIntegrationsList: async (orgId: string) =>
        channels.filter((c) => c.organizationId === orgId && !c.deletedAt),
      getIntegrationById: async (orgId: string, id: string) =>
        channels.find((c) => c.organizationId === orgId && c.id === id),
    },
  }
) as IntegrationService;

const workflow = vi.fn(async () => {});
const savePost = vi.fn(
  async (type: string, _orgId: string, date: string, post: any) => ({
    posts: [
      {
        id: `post-${post.integration.id}`,
        state: type === 'draft' ? 'DRAFT' : 'QUEUE',
        publishDate: date,
      },
    ],
  })
);
const posts = Object.assign(Object.create(PostsService.prototype), {
  _integrationService: integrations,
  _integrationManager: { getSocialIntegration: () => ({}) },
  _postRepository: {
    createOrUpdatePost: savePost,
    getPostById: async () => null,
    getPosts: async () =>
      channels.map((c) => ({
        id: `post-${c.id}`,
        integration: c,
        publishDate: new Date('2030-01-01T12:00:00Z'),
        state: 'QUEUE',
        content: c.name,
        settings: '{}',
        group: 'group',
      })),
  },
  detachStaleAnchors: vi.fn(async () => {}),
  startWorkflow: workflow,
  validatePosts: vi.fn(async () => [
    { valid: true, errors: true, emptyContent: false, tooLong: false },
  ]),
}) as PostsService;
const upload = vi.fn(async (_orgId: string, _url: string) => ({
  id: 'media-1',
  path: 'https://media.example/video.mp4',
}));
const getProviderTools = vi.fn(() => ({ linkedin: [] }));
const integrationManager = {
  getAllTools: getProviderTools,
  getAllRulesDescription: () => ({
    linkedin: 'Use this account’s media requirements.',
  }),
};

const socialPost = (id: string, type = 'schedule') => ({
  integrationId: id,
  isPremium: false,
  date: '2030-01-01T12:00:00Z',
  shortLink: false,
  type,
  postsAndComments: [
    {
      content: '<p>Agent-created media post</p>',
      attachments: ['https://media.example/video.mp4'],
    },
  ],
  settings: [],
});

async function connect(credential = token) {
  const client = new Client({ name: 'Reachly test agent', version: '1.0.0' });
  clients.push(client);
  await client.connect(
    new StreamableHTTPClientTransport(new URL(`${base}/mcp/agent`), {
      requestInit: { headers: { Authorization: `Bearer ${credential}` } },
    })
  );
  return client;
}

const output = (result: any) =>
  JSON.parse(result.content.find((c: any) => c.type === 'text').text);

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  const tools: Record<string, any> = {};
  for (const tool of [
    new IntegrationListTool(integrations),
    new IntegrationSchedulePostTool(posts, integrations),
    new PostsListTool(posts, integrations),
    new PostSettingsTool(posts),
    new UploadFromUrlTool({ uploadFromUrl: upload } as any),
    new IntegrationTriggerTool(
      integrationManager as any,
      integrations,
      {} as any
    ),
    new IntegrationValidationTool(integrationManager as any),
  ])
    tools[tool.name] = await tool.run();
  tools.unrelatedAdminTool = createTool({
    id: 'unrelatedAdminTool',
    description: 'Not allowed',
    inputSchema: z.object({}),
    execute: async () => ({}),
  });
  startAgentMcp(
    { get: () => organizations, use: app.use.bind(app) } as any,
    tools
  );
  server = await new Promise<Server>((resolve) => {
    const running = app.listen(0, '127.0.0.1', () => resolve(running));
  });
  base = `http://127.0.0.1:${(server.address() as any).port}`;
});

beforeEach(async () => {
  channels = [
    makeChannel('enabled', true),
    makeChannel('disabled', false),
    makeChannel('other-tenant', true, 'workspace-b'),
  ];
  const result = await organizations.rotateAgentMcpToken(org.id);
  token = result.token;
  vi.clearAllMocks();
});

afterAll(async () => {
  await Promise.all(clients.map((client) => client.close()));
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('Streamable HTTP agent endpoint', () => {
  it('rejects missing and general API credentials', async () => {
    expect((await fetch(`${base}/mcp/agent`, { method: 'POST' })).status).toBe(
      401
    );
    await expect(connect('general-api-key')).rejects.toThrow();
  });

  it('stores only the credential hash and immediately revokes or replaces old credentials', async () => {
    await organizations.rotateAgentMcpToken(org.id);
    const hash = setHash.mock.calls.at(-1)![1];
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toBe(token);
    await expect(connect(token)).rejects.toThrow();
    const { token: newToken } = await organizations.rotateAgentMcpToken(org.id);
    const client = await connect(newToken);
    await organizations.revokeAgentMcpToken(org.id);
    await expect(client.listTools()).rejects.toThrow();
    expect(tokenHash).toBeNull();
  });

  it('exposes publishing tools and only opted-in accounts', async () => {
    const client = await connect();
    const names = (await client.listTools()).tools.map((t) => t.name);
    expect(names).toContain('integrationSchedulePostTool');
    expect(names).toContain('uploadFromUrlTool');
    expect(names).not.toContain('unrelatedAdminTool');
    const result = await client.callTool({
      name: 'integrationList',
      arguments: {},
    });
    expect(output(result).output.map((p: any) => p.id)).toEqual(['enabled']);
  });

  it.each(['schedule', 'now', 'draft'])(
    'creates a media post using the existing %s publishing pipeline',
    async (type) => {
      const client = await connect();
      const schema = output(
        await client.callTool({
          name: 'integrationSchema',
          arguments: { platform: 'linkedin', isPremium: false },
        })
      );
      expect(schema.output.maxLength).toBeGreaterThan(0);
      const media = output(
        await client.callTool({
          name: 'uploadFromUrlTool',
          arguments: { url: 'https://content.example/generated-video.mp4' },
        })
      );
      expect(media.path).toBe('https://media.example/video.mp4');
      expect(upload).toHaveBeenCalledWith(
        org.id,
        'https://content.example/generated-video.mp4'
      );
      const result = await client.callTool({
        name: 'integrationSchedulePostTool',
        arguments: { socialPost: [socialPost('enabled', type)] },
      });
      expect(result.isError).not.toBe(true);
      expect(output(result).output[0].postId).toBe('post-enabled');
      expect(savePost).toHaveBeenCalledWith(
        type,
        org.id,
        expect.any(String),
        expect.objectContaining({
          integration: expect.objectContaining({ id: 'enabled' }),
          value: [
            expect.objectContaining({
              image: [expect.objectContaining({ path: media.path })],
            }),
          ],
        }),
        [],
        'MCP',
        undefined,
        false
      );
      expect(workflow).toHaveBeenCalledWith(
        'linkedin',
        'post-enabled',
        org.id,
        type === 'draft' ? 'DRAFT' : 'QUEUE'
      );
    }
  );

  it.each(['disabled', 'other-tenant', 'missing'])(
    'rejects a mixed batch containing %s before any post is saved',
    async (id) => {
      const client = await connect();
      const result = await client.callTool({
        name: 'integrationSchedulePostTool',
        arguments: { socialPost: [socialPost('enabled'), socialPost(id)] },
      });
      expect(result.isError).toBe(true);
      expect(savePost).not.toHaveBeenCalled();
      expect(posts.validatePosts).not.toHaveBeenCalled();
    }
  );

  it.each([
    { socialPost: [] },
    { socialPost: [{ ...socialPost('enabled'), postsAndComments: [] }] },
    { socialPost: [{ ...socialPost('enabled'), date: 'tomorrow' }] },
  ])(
    'rejects empty batches, empty posts, and ambiguous dates before saving',
    async (args) => {
      const client = await connect();
      const result = await client.callTool({
        name: 'integrationSchedulePostTool',
        arguments: args,
      });
      expect(result.isError).toBe(true);
      expect(savePost).not.toHaveBeenCalled();
    }
  );

  it('applies account disablement to an already-connected agent', async () => {
    const client = await connect();
    channels[0].agentPublishingEnabled = false;
    const result = await client.callTool({
      name: 'integrationSchedulePostTool',
      arguments: { socialPost: [socialPost('enabled', 'now')] },
    });
    expect(result.isError).toBe(true);
    expect(savePost).not.toHaveBeenCalled();
  });

  it('returns only post history from enabled accounts', async () => {
    const client = await connect();
    const result = await client.callTool({
      name: 'postsListTool',
      arguments: {
        startDate: '2030-01-01T00:00:00Z',
        endDate: '2031-01-01T00:00:00Z',
      },
    });
    expect(
      output(result).output.posts.map((p: any) => p.integrationId)
    ).toEqual(['enabled']);
  });

  it('rejects provider helper calls against accounts that were not enabled', async () => {
    const client = await connect();
    const result = await client.callTool({
      name: 'triggerTool',
      arguments: {
        integrationId: 'disabled',
        methodName: 'readProviderData',
        dataSchema: [],
      },
    });
    expect(result.isError).toBe(true);
    expect(getProviderTools).not.toHaveBeenCalled();
  });

  it('keeps existing in-app and advanced MCP channel discovery unchanged', async () => {
    const tool = new IntegrationListTool(integrations).run();
    const ctx = new RequestContext();
    const result = await runWithContext(
      { requestId: 'legacy', auth: org },
      () => tool.execute!({}, { requestContext: ctx } as any)
    );
    expect((result as any).output.map((p: any) => p.id)).toEqual([
      'enabled',
      'disabled',
    ]);
  });

  it('checks account permissions in the post service even when a caller bypasses the tool', async () => {
    await expect(
      runWithContext(
        { requestId: 'test', auth: org, agentPublishing: true },
        () =>
          posts.createPost(
            org.id,
            {
              type: 'now',
              posts: [{ integration: { id: 'disabled' } }],
            } as any,
            'MCP'
          )
      )
    ).rejects.toThrow('Agent publishing is not enabled');
    expect(savePost).not.toHaveBeenCalled();
  });

  it('cannot update settings of a post on a disabled account', async () => {
    const getPosts = vi
      .spyOn(posts, 'getPostsRecursively')
      .mockResolvedValue([
        { integrationId: 'disabled', state: 'QUEUE' },
      ] as any);
    const client = await connect();
    const result = await client.callTool({
      name: 'postSettingsTool',
      arguments: { id: 'post-disabled', settings: [] },
    });
    expect(output(result).output.errors).toContain(
      'Agent publishing is not enabled'
    );
    expect(savePost).not.toHaveBeenCalled();
    getPosts.mockRestore();
  });
});

describe('account permission persistence', () => {
  it('scopes an account update to the current workspace and excludes deleted accounts', async () => {
    const updateMany = vi.fn(async () => ({ count: 0 }));
    const repo = Object.assign(Object.create(IntegrationRepository.prototype), {
      _integration: { model: { integration: { updateMany } } },
    });
    const service = Object.assign(Object.create(IntegrationService.prototype), {
      _integrationRepository: repo,
    });
    await expect(
      service.setAgentPublishingEnabled(org.id, 'other-tenant', true)
    ).rejects.toThrow('Account not found');
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'other-tenant', organizationId: org.id, deletedAt: null },
      data: { agentPublishingEnabled: true },
    });
  });
});
