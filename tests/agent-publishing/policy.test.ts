import { describe, it, expect } from 'vitest';
import {
  createAgentMcpToken,
  hashAgentMcpToken,
  canAgentPublish,
} from '../../libraries/nestjs-libraries/src/chat/agent-publishing.policy';

const account = {
  agentPublishingEnabled: true,
  disabled: false,
  deletedAt: null,
  refreshNeeded: false,
  inBetweenSteps: false,
};

describe('agent publishing policy', () => {
  it('uses distinct, high-entropy credentials and hashes instead of storing the bearer', () => {
    const first = createAgentMcpToken();
    const second = createAgentMcpToken();
    expect(first).toMatch(/^rch_mcp_[a-f0-9]{64}$/);
    expect(first).not.toBe(second);
    expect(hashAgentMcpToken(first)).toHaveLength(64);
    expect(hashAgentMcpToken(first)).not.toBe(first);
    expect(hashAgentMcpToken(first)).toBe(hashAgentMcpToken(first));
    expect(hashAgentMcpToken(first)).not.toBe(hashAgentMcpToken(second));
  });

  it.each([
    '',
    'legacy-api-key',
    'rch_mcp_short',
    `rch_mcp_${'g'.repeat(64)}`,
    `rch_mcp_${'a'.repeat(64)}extra`,
  ])('rejects malformed or other-purpose credentials: %s', (token) => {
    expect(hashAgentMcpToken(token)).toBeNull();
  });

  it('permits an explicitly enabled, healthy account', () => {
    expect(canAgentPublish(account)).toBe(true);
  });

  it.each([
    { agentPublishingEnabled: false },
    { disabled: true },
    { deletedAt: new Date() },
    { refreshNeeded: true },
    { inBetweenSteps: true },
  ])('blocks accounts that are not eligible: %j', (override) => {
    expect(canAgentPublish({ ...account, ...override })).toBe(false);
  });
});
