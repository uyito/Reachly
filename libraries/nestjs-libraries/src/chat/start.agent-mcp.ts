import { INestApplication } from '@nestjs/common';
import { MCPServer } from '@mastra/mcp';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { OrganizationService } from '@reachly/nestjs-libraries/database/prisma/organizations/organization.service';
import { runWithContext } from './async.storage';

// No catch-all agent or unrelated tools: this credential is only for publishing.
export const agentPublishingToolNames = new Set([
  'integrationList',
  'integrationSchema',
  'triggerTool',
  'integrationSchedulePostTool',
  'postsListTool',
  'postSettingsTool',
  'uploadFromUrlTool',
]);

export const startAgentMcp = (
  app: INestApplication,
  tools: Record<string, any>
) => {
  const organizations = app.get(OrganizationService, { strict: false });
  const server = new MCPServer({
    name: 'Reachly Agent Publishing',
    version: '1.0.0',
    tools: Object.fromEntries(
      Object.entries(tools).filter(([name]) =>
        agentPublishingToolNames.has(name)
      )
    ),
  });

  app.use(
    '/mcp/agent',
    async (req: Request, res: Response, next: NextFunction) => {
      if (req.path !== '/' && req.path !== '') return next();
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, DELETE, OPTIONS'
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Authorization, Content-Type, Accept, MCP-Protocol-Version, Mcp-Session-Id'
      );
      res.setHeader(
        'Access-Control-Expose-Headers',
        'MCP-Protocol-Version, Mcp-Session-Id'
      );
      if (req.method === 'OPTIONS') return res.sendStatus(204);

      try {
        const token = /^Bearer\s+(\S+)$/i.exec(
          req.headers.authorization || ''
        )?.[1];
        const org = token
          ? await organizations.getOrgByAgentMcpToken(token)
          : null;
        if (!org) {
          res.setHeader(
            'WWW-Authenticate',
            'Bearer realm="Reachly Agent Publishing"'
          );
          return res
            .status(401)
            .json({ error: 'Invalid or revoked agent credential' });
        }
        const base =
          process.env.NEXT_PUBLIC_OVERRIDE_BACKEND_URL ||
          process.env.NEXT_PUBLIC_BACKEND_URL!;
        const url = new URL(`${base.replace(/\/$/, '')}/mcp/agent`);
        await runWithContext(
          { requestId: randomUUID(), auth: org, agentPublishing: true },
          () =>
            server.startHTTP({
              url,
              httpPath: url.pathname,
              options: { serverless: true, enableJsonResponse: true },
              req,
              res,
            })
        );
      } catch (error) {
        next(error);
      }
    }
  );
};
