'use client';

import { useCallback, useState } from 'react';
import useSWR from 'swr';
import copy from 'copy-to-clipboard';
import { useFetch } from '@reachly/helpers/utils/custom.fetch';
import { useUser } from '@reachly/frontend/components/layout/user.context';
import { useVariables } from '@reachly/react/helpers/variable.context';
import { useToaster } from '@reachly/react/toaster/toaster';
import { useDecisionModal } from '@reachly/frontend/components/layout/new-modal';

type PublishingAccount = {
  id: string;
  name: string;
  platform: string;
  agentPublishingEnabled: boolean;
  available: boolean;
};

type PublishingSettings = { hasToken: boolean; accounts: PublishingAccount[] };

export const AgentPublishing = () => {
  const user = useUser();
  const fetch = useFetch();
  const { backendUrl, mcpUrl } = useVariables();
  const toast = useToaster();
  const decision = useDecisionModal();
  const admin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
  const [credential, setCredential] = useState<{
    orgId: string;
    token: string;
  } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const token = credential?.orgId === user?.orgId ? credential?.token : '';
  const endpoint = `${(mcpUrl || backendUrl).replace(/\/$/, '')}/mcp/agent`;

  const request = useCallback(
    async (url: string, options?: RequestInit) => {
      const response = await fetch(url, options);
      if (!response || !response.ok)
        throw new Error(
          'Unable to save agent publishing settings. Please try again.'
        );
      return response.json();
    },
    [fetch]
  );

  const {
    data,
    error: loadError,
    mutate,
  } = useSWR<PublishingSettings>(
    admin ? ['/settings/agent-publishing', user?.orgId] : null,
    ([url]: [string, string]) => request(url),
    { revalidateOnFocus: true }
  );

  const updateAccount = async (
    account: PublishingAccount,
    enabled: boolean
  ) => {
    setBusy(account.id);
    setError('');
    try {
      await request(
        `/integrations/${encodeURIComponent(account.id)}/agent-publishing`,
        {
          method: 'PUT',
          body: JSON.stringify({ enabled }),
        }
      );
      await mutate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to update this account.'
      );
    } finally {
      setBusy(null);
    }
  };

  const rotate = async () => {
    if (
      data?.hasToken &&
      !(await decision.open({
        title: 'Replace agent credential?',
        description:
          'Agents using the current credential will lose access. Update them with the new credential.',
        approveLabel: 'Replace credential',
        cancelLabel: 'Cancel',
      }))
    )
      return;
    setBusy('token');
    setError('');
    setCredential(null);
    try {
      const result = await request('/settings/agent-publishing/token', {
        method: 'POST',
      });
      setCredential({ orgId: user!.orgId, token: result.token });
      await mutate();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create an agent credential.'
      );
    } finally {
      setBusy(null);
    }
  };

  const revoke = async () => {
    if (
      !(await decision.open({
        title: 'Disconnect agents?',
        description:
          'The current credential will stop working immediately. Posts already scheduled will still publish.',
        approveLabel: 'Disconnect agents',
        cancelLabel: 'Cancel',
      }))
    )
      return;
    setBusy('revoke');
    setError('');
    try {
      await request('/settings/agent-publishing/token', { method: 'DELETE' });
      setCredential(null);
      await mutate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to disconnect agents.'
      );
    } finally {
      setBusy(null);
    }
  };

  const copyValue = (value: string) => {
    if (copy(value)) toast.show('Copied to clipboard', 'success');
    else setError('Could not copy. Select and copy the value manually.');
  };

  if (!admin)
    return (
      <p>
        Ask a workspace administrator to enable agent publishing for your social
        accounts.
      </p>
    );

  return (
    <section className="flex flex-col gap-[20px]" aria-label="Agent publishing">
      <div>
        <h4 className="text-[20px] font-semibold">Agent publishing</h4>
        <p className="text-[14px] text-customColor18 mt-[8px]">
          Connect your agent once. It can upload images and videos, schedule
          posts, or publish immediately to the accounts you enable below,
          without opening Reachly or approving each post here.
        </p>
      </div>
      {(error || loadError) && (
        <p role="alert" className="text-red-400">
          {error || 'Unable to load agent publishing settings.'}
        </p>
      )}
      {loadError && (
        <button type="button" onClick={() => mutate()}>
          Retry
        </button>
      )}
      {!data && !loadError && <p role="status">Loading accounts…</p>}
      {data && (
        <>
          <div className="p-[20px] bg-newBgColorInner border border-newBorder rounded-[12px] flex flex-col gap-[12px]">
            <h5 className="font-semibold">1. Choose accounts</h5>
            <p className="text-[13px] text-customColor18">
              Enabling an account allows automatic publishing. Turning it off
              blocks new agent actions; posts already scheduled stay on the
              calendar.
            </p>
            {!data.accounts.length && (
              <p>Connect a social account in the calendar to get started.</p>
            )}
            {data.accounts.map((account) => (
              <label
                key={account.id}
                className="flex items-center justify-between gap-[16px] border-b border-newBorder py-[12px]"
              >
                <span>
                  <span className="font-semibold">{account.name}</span>
                  <span className="block text-[13px] text-customColor18">
                    {account.platform}
                    {!account.available &&
                      ' · Reconnect or enable this account before agents can publish'}
                  </span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  aria-label={`Allow agent publishing for ${account.name} (${account.platform})`}
                  checked={account.agentPublishingEnabled}
                  disabled={
                    !!busy ||
                    (!account.available && !account.agentPublishingEnabled)
                  }
                  onChange={(event) =>
                    updateAccount(account, event.target.checked)
                  }
                  className="w-[20px] h-[20px] accent-[#612BD3]"
                />
              </label>
            ))}
          </div>
          <div className="p-[20px] bg-newBgColorInner border border-newBorder rounded-[12px] flex flex-col gap-[12px]">
            <h5 className="font-semibold">2. Connect your agent</h5>
            <p className="text-[13px] text-customColor18">
              Use Streamable HTTP with this endpoint and a Bearer credential.
              This credential grants access to the media library and enabled
              accounts.
            </p>
            <label className="flex flex-col gap-[6px]">
              MCP endpoint
              <input
                readOnly
                value={endpoint}
                className="p-[12px] rounded-[8px] bg-newBgColorInnerInner w-full"
              />
            </label>
            <button
              type="button"
              onClick={() => copyValue(endpoint)}
              className="text-left underline"
            >
              Copy endpoint
            </button>
            <div className="flex flex-wrap gap-[12px]">
              <button
                type="button"
                disabled={!!busy}
                onClick={rotate}
                className="bg-[#612BD3] rounded-[8px] px-[16px] py-[10px] disabled:opacity-50"
              >
                {busy === 'token'
                  ? 'Creating…'
                  : data.hasToken
                  ? 'Replace credential'
                  : 'Create credential'}
              </button>
              {data.hasToken && (
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={revoke}
                  className="rounded-[8px] px-[16px] py-[10px] border border-newBorder disabled:opacity-50"
                >
                  Disconnect agents
                </button>
              )}
            </div>
            {token && (
              <div className="flex flex-col gap-[8px]">
                <p>
                  Copy this credential now. It is shown only until you leave
                  this page.
                </p>
                <input
                  type="password"
                  readOnly
                  value={token}
                  aria-label="Agent credential"
                  autoComplete="off"
                  className="p-[12px] rounded-[8px] bg-newBgColorInnerInner"
                />
                <button
                  type="button"
                  onClick={() => copyValue(token)}
                  className="text-left underline"
                >
                  Copy credential
                </button>
                <pre className="p-[12px] rounded-[8px] bg-newBgColorInnerInner overflow-x-auto text-[13px]">
                  {JSON.stringify(
                    {
                      mcpServers: {
                        reachly: {
                          url: endpoint,
                          headers: {
                            Authorization: 'Bearer <YOUR_AGENT_CREDENTIAL>',
                          },
                        },
                      },
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
            {data.hasToken && !token && (
              <p className="text-[13px] text-customColor18">
                An agent credential is active. If you lost it, replace it and
                reconnect your agents.
              </p>
            )}
            <p className="text-[13px] text-customColor18">
              Your agent can discover enabled accounts, upload media from a URL,
              read each platform’s posting requirements, and create drafts,
              scheduled posts, or immediate posts. Social accounts must stay
              connected for publishing to succeed.
            </p>
          </div>
        </>
      )}
    </section>
  );
};
