export const dynamic = 'force-dynamic';
import { Login } from '@reachly/frontend/components/auth/login';
import { Metadata } from 'next';
import { isGeneralServerSide } from '@reachly/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? 'Reachly' : 'Reachly'} Login`,
  description: '',
};
export default async function Auth() {
  return <Login />;
}
