import { createHash, randomBytes } from 'node:crypto';

export const createAgentMcpToken = () =>
  `rch_mcp_${randomBytes(32).toString('hex')}`;

export const hashAgentMcpToken = (token: string): string | null => {
  if (!/^rch_mcp_[a-f0-9]{64}$/.test(token)) return null;
  return createHash('sha256').update(token).digest('hex');
};

export type AgentPublishingChannel = {
  agentPublishingEnabled: boolean;
  disabled: boolean;
  deletedAt: Date | null;
  refreshNeeded: boolean;
  inBetweenSteps: boolean;
};

export const canAgentPublish = (channel: AgentPublishingChannel) =>
  channel.agentPublishingEnabled &&
  !channel.disabled &&
  !channel.deletedAt &&
  !channel.refreshNeeded &&
  !channel.inBetweenSteps;
