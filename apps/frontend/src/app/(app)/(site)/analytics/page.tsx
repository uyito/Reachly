export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { PlatformAnalytics } from '@reachly/frontend/components/platform-analytics/platform.analytics';
import { isGeneralServerSide } from '@reachly/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? 'Reachly' : 'Reachly'} Analytics`,
  description: '',
};
export default async function Index() {
  return <PlatformAnalytics />;
}
