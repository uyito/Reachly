export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { Activate } from '@reachly/frontend/components/auth/activate';
import { isGeneralServerSide } from '@reachly/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${
    isGeneralServerSide() ? 'Reachly' : 'Reachly'
  } - Activate your account`,
  description: '',
};
export default async function Auth() {
  return <Activate />;
}
