import { MediaLayoutComponent } from '@reachly/frontend/components/new-layout/layout.media.component';
import { Metadata } from 'next';
import { isGeneralServerSide } from '@reachly/helpers/utils/is.general.server.side';

export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? 'Reachly' : 'Reachly'} Media`,
  description: '',
};

export default async function Page() {
  return <MediaLayoutComponent />
}
