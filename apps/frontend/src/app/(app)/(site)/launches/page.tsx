export const dynamic = 'force-dynamic';
import { LaunchesComponent } from '@reachly/frontend/components/launches/launches.component';
import { Metadata } from 'next';
import { isGeneralServerSide } from '@reachly/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? 'Reachly Calendar' : 'Reachly Launches'}`,
  description: '',
};
export default async function Index() {
  return <LaunchesComponent />;
}
