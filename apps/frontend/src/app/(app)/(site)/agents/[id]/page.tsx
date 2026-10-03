import { Metadata } from 'next';
import { Agent } from '@reachly/frontend/components/agents/agent';
import { AgentChat } from '@reachly/frontend/components/agents/agent.chat';
export const metadata: Metadata = {
  title: 'Reachly - Agent',
  description: '',
};
export default async function Page() {
  return (
    <AgentChat />
  );
}
