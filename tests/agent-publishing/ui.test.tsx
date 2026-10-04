// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { SWRConfig } from 'swr';
import { AgentPublishing } from '../../apps/frontend/src/components/public-api/agent-publishing.component';

const fixture = vi.hoisted(() => ({
  user: { orgId: 'workspace-a', role: 'ADMIN' },
  api: vi.fn(),
  copy: vi.fn(() => true),
  confirm: vi.fn(async () => true),
}));

vi.mock('@reachly/helpers/utils/custom.fetch', () => ({
  useFetch: () => fixture.api,
}));
vi.mock('@reachly/frontend/components/layout/user.context', () => ({
  useUser: () => fixture.user,
}));
vi.mock('@reachly/react/helpers/variable.context', () => ({
  useVariables: () => ({ backendUrl: 'https://reachly.example/api' }),
}));
vi.mock('@reachly/react/toaster/toaster', () => ({
  useToaster: () => ({ show: vi.fn() }),
}));
vi.mock('@reachly/frontend/components/layout/new-modal', () => ({
  useDecisionModal: () => ({ open: fixture.confirm }),
}));
vi.mock('copy-to-clipboard', () => ({ default: fixture.copy }));

let settings: { hasToken: boolean; accounts: any[] };
const credential = `rch_mcp_${'a'.repeat(64)}`;
const mount = () =>
  render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <AgentPublishing />
    </SWRConfig>
  );

beforeEach(() => {
  vi.clearAllMocks();
  fixture.user = { orgId: 'workspace-a', role: 'ADMIN' };
  fixture.confirm.mockResolvedValue(true);
  settings = {
    hasToken: false,
    accounts: [
      {
        id: 'account-1',
        name: 'Company account',
        platform: 'linkedin',
        agentPublishingEnabled: false,
        available: true,
      },
    ],
  };
  fixture.api.mockImplementation(async (url: string, options?: RequestInit) => {
    if (url === '/integrations/account-1/agent-publishing') {
      settings.accounts[0].agentPublishingEnabled = JSON.parse(
        options!.body as string
      ).enabled;
      return new Response('{}', { status: 200 });
    }
    if (url === '/settings/agent-publishing/token') {
      settings.hasToken = options!.method === 'POST';
      return new Response(
        JSON.stringify(
          options!.method === 'POST' ? { token: credential } : { success: true }
        )
      );
    }
    return new Response(JSON.stringify(settings));
  });
});

afterEach(cleanup);

describe('agent publishing settings', () => {
  it('shows the deployment-prefixed endpoint and disabled-by-default accounts', async () => {
    mount();
    const toggle = await screen.findByRole('switch', {
      name: 'Allow agent publishing for Company account (linkedin)',
    });
    expect((toggle as HTMLInputElement).checked).toBe(false);
    expect(
      (screen.getByLabelText('MCP endpoint') as HTMLInputElement).value
    ).toBe('https://reachly.example/api/mcp/agent');
  });

  it('persists an account opt-in and updates the switch after saving', async () => {
    mount();
    const toggle = await screen.findByRole('switch');
    fireEvent.click(toggle);
    await waitFor(() =>
      expect(fixture.api).toHaveBeenCalledWith(
        '/integrations/account-1/agent-publishing',
        {
          method: 'PUT',
          body: JSON.stringify({ enabled: true }),
        }
      )
    );
    await waitFor(() =>
      expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(
        true
      )
    );
  });

  it('does not enable a switch when saving fails', async () => {
    fixture.api.mockImplementation(async (url: string) =>
      url.includes('/integrations/')
        ? new Response('{}', { status: 403 })
        : new Response(JSON.stringify(settings))
    );
    mount();
    fireEvent.click(await screen.findByRole('switch'));
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(
      false
    );
  });

  it('creates a credential shown only in memory and keeps it out of the example config', async () => {
    mount();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Create credential' })
    );
    const input = await screen.findByLabelText('Agent credential');
    expect((input as HTMLInputElement).value).toBe(credential);
    expect((input as HTMLInputElement).type).toBe('password');
    expect(document.querySelector('pre')!.textContent).toContain(
      'Bearer <YOUR_AGENT_CREDENTIAL>'
    );
    expect(document.querySelector('pre')!.textContent).not.toContain(
      credential
    );
    expect(localStorage.length).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Copy credential' }));
    expect(fixture.copy).toHaveBeenCalledWith(credential);
  });

  it('clears a generated credential when agents are disconnected', async () => {
    mount();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Create credential' })
    );
    await screen.findByLabelText('Agent credential');
    fireEvent.click(
      await screen.findByRole('button', { name: 'Disconnect agents' })
    );
    await waitFor(() =>
      expect(fixture.api).toHaveBeenCalledWith(
        '/settings/agent-publishing/token',
        { method: 'DELETE' }
      )
    );
    await waitFor(() =>
      expect(screen.queryByLabelText('Agent credential')).toBeNull()
    );
  });

  it('does not reveal the previous workspace credential after switching workspaces', async () => {
    const view = mount();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Create credential' })
    );
    await screen.findByLabelText('Agent credential');
    fixture.user = { orgId: 'workspace-b', role: 'ADMIN' };
    view.rerender(
      <SWRConfig value={{ provider: () => new Map() }}>
        <AgentPublishing />
      </SWRConfig>
    );
    await screen.findByRole('switch');
    expect(screen.queryByLabelText('Agent credential')).toBeNull();
  });

  it('does not let regular members create credentials or change accounts', () => {
    fixture.user = { orgId: 'workspace-a', role: 'USER' };
    mount();
    expect(screen.getByText(/Ask a workspace administrator/)).toBeTruthy();
    expect(screen.queryByRole('switch')).toBeNull();
    expect(fixture.api).not.toHaveBeenCalled();
  });

  it('requires reconnect before granting access to an unavailable account', async () => {
    settings.accounts[0].available = false;
    mount();
    expect(
      ((await screen.findByRole('switch')) as HTMLInputElement).disabled
    ).toBe(true);
  });
});
