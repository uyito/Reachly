import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { SettingsController } from '../../apps/backend/src/api/routes/settings.controller';
import { IntegrationsController } from '../../apps/backend/src/api/routes/integrations.controller';
import { WorkspaceAdminGuard } from '../../apps/backend/src/services/auth/workspace.admin.guard';
import { AgentPublishingDto } from '../../libraries/nestjs-libraries/src/dtos/integrations/agent-publishing.dto';
import { validate } from 'class-validator';

vi.mock('@reachly/nestjs-libraries/redis/redis.service', () => ({
  ioRedis: {},
}));

const guard = new WorkspaceAdminGuard();
const context = (request: any) =>
  ({ switchToHttp: () => ({ getRequest: () => request }) } as any);

describe('agent publishing administration', () => {
  it('registers the workspace administrator guard on all permission and credential endpoints', () => {
    for (const handler of [
      SettingsController.prototype.getAgentPublishing,
      SettingsController.prototype.rotateAgentToken,
      SettingsController.prototype.revokeAgentToken,
      IntegrationsController.prototype.setAgentPublishing,
    ]) {
      expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toContain(
        WorkspaceAdminGuard
      );
    }
  });
  it.each(['ADMIN', 'SUPERADMIN'])(
    'allows an active database membership with role %s',
    (role) => {
      expect(
        guard.canActivate(
          context({
            user: { id: 'u' },
            org: { users: [{ userId: 'u', role, disabled: false }] },
          })
        )
      ).toBe(true);
    }
  );

  it.each([
    {
      user: { id: 'u', role: 'ADMIN' },
      org: { users: [{ userId: 'u', role: 'USER', disabled: false }] },
    },
    {
      user: { id: 'u' },
      org: {
        users: [{ userId: 'other-user', role: 'ADMIN', disabled: false }],
      },
    },
    {
      user: { id: 'u' },
      org: { users: [{ userId: 'u', role: 'ADMIN', disabled: true }] },
    },
    {},
  ])(
    'rejects regular users, spoofed roles, missing membership, and disabled members',
    (request) => {
      expect(() => guard.canActivate(context(request))).toThrow(
        'Only workspace administrators'
      );
    }
  );

  it.each([undefined, null, 'true', 'false', 1])(
    'rejects a non-boolean account permission: %s',
    async (enabled) => {
      const dto = Object.assign(new AgentPublishingDto(), { enabled });
      expect(await validate(dto)).not.toHaveLength(0);
    }
  );

  it.each([true, false])(
    'accepts an explicit boolean account permission: %s',
    async (enabled) => {
      expect(
        await validate(Object.assign(new AgentPublishingDto(), { enabled }))
      ).toHaveLength(0);
    }
  );
});
