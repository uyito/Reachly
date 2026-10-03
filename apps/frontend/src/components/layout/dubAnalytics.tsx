'use client';

import { useVariables } from '@reachly/react/helpers/variable.context';
import { Analytics as DubAnalyticsIn } from '@dub/analytics/react';
import { getCookie } from 'react-use-cookie';

export const DubAnalytics = () => {
  const { dub } = useVariables();
  if (!dub || !process.env.NEXT_PUBLIC_DUB_DOMAIN) return null;
  return (
    <DubAnalyticsIn
      domainsConfig={{
        refer: process.env.NEXT_PUBLIC_DUB_DOMAIN,
      }}
    />
  );
};

export const useDubClickId = () => {
  const { dub } = useVariables();
  if (!dub) return undefined;

  const dubCookie = getCookie('dub_partner_data', '{}');
  return JSON.parse(dubCookie)?.clickId || undefined;
};
