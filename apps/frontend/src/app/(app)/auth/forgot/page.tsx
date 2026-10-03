export const dynamic = 'force-dynamic';
import { Forgot } from '@reachly/frontend/components/auth/forgot';
import { Metadata } from 'next';
import { isGeneralServerSide } from '@reachly/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? 'Reachly' : 'Reachly'} Forgot Password`,
  description: '',
};
export default async function Auth() {
  return <Forgot />;
}
